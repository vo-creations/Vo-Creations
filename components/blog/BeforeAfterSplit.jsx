"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function BeforeAfterSplit({ beforeTitle, afterTitle, beforeItems, afterItems }) {
  const [ref, inView] = useInView();

  const columnBase = {
    borderRadius: "16px",
    padding: "32px",
  };

  const itemStyle = {
    fontFamily: tokens.fonts.body,
    fontSize: "15px",
    lineHeight: 1.7,
    padding: "8px 0",
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  return (
    <div
      ref={ref}
      style={{
        maxWidth: "800px",
        margin: "48px auto",
        padding: "0 24px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {/* Before */}
      <div
        style={{
          ...columnBase,
          background: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: tokens.colors.textDim,
            marginBottom: "20px",
          }}
        >
          {beforeTitle}
        </div>
        {beforeItems.map((item, i) => (
          <div key={i} style={{ ...itemStyle, color: tokens.colors.textDim }}>
            {item}
          </div>
        ))}
      </div>

      {/* After */}
      <div
        style={{
          ...columnBase,
          background: tokens.colors.surfaceElevated,
          borderTop: `3px solid ${tokens.colors.accent}`,
          border: `1px solid ${tokens.colors.border}`,
          borderTopColor: tokens.colors.accent,
          borderTopWidth: "3px",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          transitionDelay: "0.1s",
        }}
      >
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: tokens.colors.accent,
            marginBottom: "20px",
          }}
        >
          {afterTitle}
        </div>
        {afterItems.map((item, i) => (
          <div key={i} style={{ ...itemStyle, color: tokens.colors.text }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
