// Resonance Asia logo: stacked R/A monogram in teal next to wordmark
// Designed to read at 24px (favicon) up to 200px (welcome hero).
// Uses currentColor for the wordmark so it inverts cleanly on navy or cream.
type Variant = "horizontal" | "mark";

export function RALogo({
  variant = "horizontal",
  className,
  monoColor = "currentColor",
}: {
  variant?: Variant;
  className?: string;
  monoColor?: string;
}) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 48 48"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Resonance Asia"
      >
        <rect x="2" y="2" width="44" height="44" rx="6" fill="hsl(213 67% 17%)" />
        {/* Teal R/A mark */}
        <g fill="hsl(180 49% 48%)">
          <path d="M11 14h9.5c3.3 0 5.5 2.1 5.5 5 0 2.4-1.4 4-3.5 4.6L26.5 34h-3.6l-3.7-9.5H14V34h-3V14zm3 3v4.6h6c1.5 0 2.5-.9 2.5-2.3S21.5 17 20 17h-6z" />
          <path d="M30 34l5.5-20h3.4L44 34h-3.2l-1.3-4.8h-5.6L32.7 34H30zm5-7.5h4.4L37.2 18l-2.2 8.5z" />
        </g>
      </svg>
    );
  }

  // Horizontal: mark + wordmark
  return (
    <svg
      viewBox="0 0 280 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Resonance Asia"
    >
      {/* Mark */}
      <rect x="0" y="0" width="48" height="48" rx="6" fill="hsl(213 67% 17%)" />
      <g fill="hsl(180 49% 48%)">
        <path d="M9 14h9.5c3.3 0 5.5 2.1 5.5 5 0 2.4-1.4 4-3.5 4.6L24.5 34h-3.6l-3.7-9.5H12V34H9V14zm3 3v4.6h6c1.5 0 2.5-.9 2.5-2.3S19.5 17 18 17h-6z" />
        <path d="M28 34l5.5-20h3.4L42 34h-3.2l-1.3-4.8h-5.6L30.7 34H28zm5-7.5h4.4L35.2 18l-2.2 8.5z" />
      </g>
      {/* Wordmark */}
      <text
        x="60"
        y="22"
        fill={monoColor}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        letterSpacing="0.18em"
      >
        RESONANCE
      </text>
      <text
        x="60"
        y="40"
        fill={monoColor}
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="14"
        fontWeight="400"
        letterSpacing="0.32em"
        opacity="0.85"
      >
        ASIA
      </text>
    </svg>
  );
}
