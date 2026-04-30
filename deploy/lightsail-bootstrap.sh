#!/usr/bin/env bash
# RA Executive Assessment — one-shot Lightsail bootstrap
# Idempotent: safe to re-run if anything fails partway through.
set -euo pipefail

# === Variables ===
APP_USER="raapp"
APP_DIR="/opt/ra-assessment"
DATA_DIR="/var/lib/ra-assessment"
DOMAIN="assessments.resonanceasia.com"
GITHUB_REPO="https://github.com/ResonanceAsia/ra-assessment.git"
NODE_MAJOR="20"

log() { printf "\n\033[1;36m▸ %s\033[0m\n" "$*"; }

if [[ -z "${ADMIN_TOKEN:-}" || -z "${RESEND_API_KEY:-}" ]]; then
  echo "ERROR: ADMIN_TOKEN and RESEND_API_KEY must be set in the environment before running." >&2
  echo "Run as: ADMIN_TOKEN=... RESEND_API_KEY=... sudo -E bash lightsail-bootstrap.sh" >&2
  exit 1
fi

# === 1. System packages ===
log "Updating system + installing dependencies"
apt-get update -y
apt-get install -y curl git build-essential nginx ca-certificates ufw

# === 2. Node.js 20 ===
log "Installing Node.js ${NODE_MAJOR}.x"
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -dv -f2 | cut -d. -f1)" != "${NODE_MAJOR}" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi
node -v

# === 3. App user + directories ===
log "Creating ${APP_USER} user and directories"
id -u "${APP_USER}" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "${APP_USER}"
mkdir -p "${APP_DIR}" "${DATA_DIR}"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}" "${DATA_DIR}"

# === 4. Clone or update repo ===
log "Fetching application code"
if [[ -d "${APP_DIR}/.git" ]]; then
  sudo -u "${APP_USER}" git -C "${APP_DIR}" fetch --depth=1 origin master
  sudo -u "${APP_USER}" git -C "${APP_DIR}" reset --hard origin/master
else
  sudo -u "${APP_USER}" git clone --depth=1 "${GITHUB_REPO}" "${APP_DIR}"
fi

# === 5. Build ===
log "Installing dependencies and building"
sudo -u "${APP_USER}" bash -c "cd ${APP_DIR} && npm ci && npm run build"

# === 6. Environment file ===
log "Writing environment file"
install -m 600 -o "${APP_USER}" -g "${APP_USER}" /dev/null "${APP_DIR}/.env"
cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
PORT=5000
DATABASE_PATH=${DATA_DIR}/data.db
ADMIN_TOKEN=${ADMIN_TOKEN}
RESEND_API_KEY=${RESEND_API_KEY}
EOF
chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
chmod 600 "${APP_DIR}/.env"

# === 7. systemd service ===
log "Installing systemd service"
cat > /etc/systemd/system/ra-assessment.service <<EOF
[Unit]
Description=RA Executive Assessment
After=network.target

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/node ${APP_DIR}/dist/index.cjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ra-assessment
systemctl restart ra-assessment
sleep 3
systemctl --no-pager --lines=10 status ra-assessment || true

# === 8. nginx reverse proxy (HTTP only at this stage) ===
log "Configuring nginx"
cat > /etc/nginx/sites-available/ra-assessment <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    client_max_body_size 5M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
ln -sf /etc/nginx/sites-available/ra-assessment /etc/nginx/sites-enabled/ra-assessment
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# === 9. Firewall ===
log "Configuring firewall (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# === 10. Done ===
log "Bootstrap complete"
echo ""
echo "Next steps:"
echo "  1. Add an A record in GoDaddy: assessments → $(curl -fsS https://checkip.amazonaws.com 2>/dev/null || echo '<this server IP>')"
echo "  2. After DNS propagates (~10 min), run TLS setup:"
echo "       sudo apt-get install -y certbot python3-certbot-nginx"
echo "       sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos -m linus@resonanceasia.com --redirect"
echo ""
echo "Service health:"
curl -fsS http://127.0.0.1:5000/api/health || echo "  (health check failed — check: sudo journalctl -u ra-assessment -n 50)"
echo ""
