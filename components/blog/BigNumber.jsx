"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function BigNumber({ items }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: "800px",
        margin: "48px auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(160px, 1fr))`,
        gap: "32px",
        textAlign: "center",
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
              fontFamily: tokens.fonts.display,
              fontWeight: 900,
              fontSize: "clamp(48px, 6vw, 72px)",
              letterSpacing: "-3px",
              lineHeight: 1,
              color: tokens.colors.accent,
            }}
          >
            {item.value}
          </div>
          <div
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: tokens.colors.textDim,
              marginTop: "8px",
            }}
          >
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
