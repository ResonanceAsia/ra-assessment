// Tiny purpose-built markdown renderer for the few patterns we use in
// exhibit bodies: GFM tables, unordered lists, **bold**, and paragraphs.
// We intentionally avoid pulling in a full markdown library.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function inline(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank
    if (!line.trim()) {
      i++;
      continue;
    }

    // Table: header row + separator + body
    if (line.trim().startsWith("|") && lines[i + 1] && /^\s*\|[\s|:-]+\|\s*$/.test(lines[i + 1])) {
      const headerCells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
      i += 2; // skip header + separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(
          lines[i]
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim())
        );
        i++;
      }
      html +=
        "<table><thead><tr>" +
        headerCells.map((h) => `<th>${inline(h)}</th>`).join("") +
        "</tr></thead><tbody>" +
        rows
          .map(
            (r) =>
              "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>"
          )
          .join("") +
        "</tbody></table>";
      continue;
    }

    // List
    if (/^\s*-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, ""));
        i++;
      }
      html += "<ul>" + items.map((x) => `<li>${inline(x)}</li>`).join("") + "</ul>";
      continue;
    }

    // Paragraph
    html += `<p>${inline(line)}</p>`;
    i++;
  }

  return html;
}
