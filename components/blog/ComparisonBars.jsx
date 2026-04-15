"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function ComparisonBars({ items }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "48px auto",
        padding: "0 24px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            transitionDelay: `${i * 0.1}s`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontFamily: tokens.fonts.mono,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: item.highlight ? tokens.colors.textSecondary : tokens.colors.textDim,
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontFamily: tokens.fonts.display,
                fontWeight: 800,
                fontSize: "18px",
                color: item.highlight ? tokens.colors.accent : tokens.colors.textDim,
              }}
            >
              {item.displayValue}
            </span>
          </div>
          <div
            style={{
              height: "6px",
              borderRadius: "3px",
              background: tokens.colors.surface,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: "3px",
                width: inView ? `${item.value}%` : "0%",
                background: item.highlight ? tokens.colors.accent : tokens.colors.textDim,
                transition: "width 0.6s ease",
                transitionDelay: `${i * 0.1 + 0.2}s`,
                boxShadow: item.highlight ? `0 0 8px ${tokens.colors.accentGlow}` : "none",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
