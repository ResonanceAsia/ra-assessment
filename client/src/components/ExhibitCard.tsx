import {
  type Exhibit,
  type KeyValueRow,
  type SegmentRow,
} from "@/data/case";

/** Inline emphasis: escape HTML, then convert **bold** to <strong>. */
function inline(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

const toneClass: Record<SegmentRow["marginTone"], string> = {
  loss: "bg-destructive/10 text-destructive ring-1 ring-destructive/30",
  watch: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30",
  ok: "bg-muted text-foreground ring-1 ring-border",
  strong: "bg-accent/15 text-accent ring-1 ring-accent/40",
};

/**
 * A single row in the segment-snapshot exhibit. Designed to read cleanly even
 * when the card is constrained to ~360px wide (2-col grid on a 1280 viewport,
 * or full width on mobile). Two-line layout per segment so nothing truncates.
 */
function SegmentRowItem({ row, last }: { row: SegmentRow; last: boolean }) {
  return (
    <div className={last ? "py-3" : "py-3 border-b border-border/60"}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <div className="font-semibold text-foreground text-sm leading-tight min-w-0">
          {row.segment}
        </div>
        <div className="text-[11px] font-medium text-muted-foreground tabular-nums whitespace-nowrap">
          {row.premium}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${toneClass[row.marginTone]}`}
        >
          {row.margin}
        </span>
        <span className="text-[11px] text-muted-foreground">{row.detail}</span>
      </div>
      <div className="text-xs text-foreground/75 leading-snug">{row.note}</div>
    </div>
  );
}

/**
 * Stacked key-value list. Label sits above its value on its own line so we
 * never get the value bleeding back over the label in narrow columns. The
 * value is the prominent typographic element — foreground, semibold figures.
 */
function KeyValueList({ rows, footnote }: { rows: KeyValueRow[]; footnote?: string }) {
  return (
    <div>
      <dl className="space-y-2.5">
        {rows.map((r, i) => (
          <div
            key={i}
            className={
              i === rows.length - 1
                ? ""
                : "pb-2.5 border-b border-border/50"
            }
          >
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground leading-snug mb-0.5">
              {r.label}
            </dt>
            <dd
              className="text-sm text-foreground tabular-nums leading-snug [&_strong]:font-semibold [&_strong]:text-foreground break-words"
              dangerouslySetInnerHTML={{ __html: inline(r.value) }}
            />
          </div>
        ))}
      </dl>
      {footnote && (
        <p className="mt-3 pt-3 border-t border-border/60 text-[11px] italic text-muted-foreground leading-snug">
          {footnote}
        </p>
      )}
    </div>
  );
}

/**
 * Renders the exhibit. Title strip is consistent across all four; the body
 * shape is what differs (segment cards, key/value list, deal sections, prose).
 */
export function ExhibitCard({
  exhibit,
  compact = false,
}: {
  exhibit: Exhibit;
  compact?: boolean;
}) {
  const { id, title, subtitle, body } = exhibit;
  return (
    <div
      className={`ra-card-elevated rounded-lg flex flex-col ${
        compact ? "p-4" : "p-4 sm:p-5"
      }`}
      data-testid={`exhibit-${id}`}
    >
      {/* Header strip */}
      <div className="flex items-center gap-2 mb-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground">
          {id === "BRIEF" ? "Brief" : id}
        </span>
        <h3 className="text-sm font-semibold text-foreground leading-tight">
          {title}
        </h3>
      </div>
      {subtitle && (
        <div className="text-[11px] text-muted-foreground mb-3 ml-[2.1rem]">
          {subtitle}
        </div>
      )}
      {!subtitle && <div className="mb-2" />}

      {/* Body */}
      {body.kind === "segments" && (
        <div>
          {body.rows.map((r, i) => (
            <SegmentRowItem
              key={r.segment}
              row={r}
              last={i === body.rows.length - 1}
            />
          ))}
        </div>
      )}

      {body.kind === "keyValue" && (
        <KeyValueList rows={body.rows} footnote={body.footnote} />
      )}

      {body.kind === "deal" && (
        <div className="space-y-4">
          {body.sections.map((sec, i) => (
            <div
              key={i}
              className={
                sec.tone === "warn"
                  ? "rounded-md bg-amber-500/8 ring-1 ring-amber-500/25 p-3"
                  : ""
              }
            >
              <div
                className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${
                  sec.tone === "warn"
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-accent"
                }`}
              >
                {sec.heading}
              </div>
              <KeyValueList rows={sec.rows} />
            </div>
          ))}
        </div>
      )}

      {body.kind === "prose" && (
        <div className="space-y-2.5">
          {body.paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-sm text-foreground/90 leading-relaxed [&_strong]:font-semibold [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: inline(p) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
