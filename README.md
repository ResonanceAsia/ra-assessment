# Resonance Asia · Executive Assessment

Online assessment app for evaluating APAC C-suite executive search candidates against the Resonance Asia 3-Pillar Framework.

## Stack
- Express + Vite + React + Tailwind + shadcn/ui
- SQLite (better-sqlite3) via Drizzle ORM — data persisted to a mounted disk
- Resend for transactional email (candidate copy + RA inbox copy)

## Local development
```bash
npm install
npm run dev   # localhost:5000
```

## Production build
```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Environment
- `ADMIN_TOKEN` — bearer token for `/admin` and `/api/admin/*` (header: `x-admin-token`)
- `RESEND_API_KEY` — Resend API key for outbound mail
- `DATABASE_PATH` — full path to SQLite file (default `data.db`; Render mounts `/data/data.db`)
- `PORT` — server port (default 5000)

## Routes
- `/#/` — candidate flow (entry via single-use `?invite=<token>` link)
- `/#/admin` — invite generator (gated by `ADMIN_TOKEN`)

## Hosting
Deployed to Render. Custom domain: `assessments.resonanceasia.com`.
