import { type Exhibit } from "@/data/case";
import { renderMarkdown } from "@/lib/md";

export function ExhibitCard({ exhibit, compact = false }: { exhibit: Exhibit; compact?: boolean }) {
  return (
    <div
      className="ra-card-elevated rounded-lg p-4 sm:p-5"
      data-testid={`exhibit-${exhibit.id}`}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground">
          {exhibit.id === "BRIEF" ? "Brief" : exhibit.id}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{exhibit.title}</h3>
      </div>
      <div
        className={`exhibit-prose text-sm text-foreground/90 ${
          compact ? "" : "leading-relaxed"
        }`}
        dangerouslySetInnerHTML={{ __html: renderMarkdown(exhibit.body) }}
      />
    </div>
  );
}
