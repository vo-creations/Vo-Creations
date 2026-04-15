"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function EmphasisBlock({ children }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "40px auto",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          borderLeft: `3px solid ${tokens.colors.accent}`,
          background: tokens.colors.surfaceElevated,
          borderRadius: "0 12px 12px 0",
          padding: "24px 28px",
          fontFamily: tokens.fonts.body,
          fontSize: "19px",
          lineHeight: 1.65,
          color: tokens.colors.text,
          boxShadow: `-4px 0 12px ${tokens.colors.accentGlow}`,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}
