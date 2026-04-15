"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function SectionHeading({ children }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "0 auto",
        padding: "0 24px",
        marginTop: "72px",
        marginBottom: "28px",
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
          color: tokens.colors.accent,
          marginBottom: "10px",
        }}
      >
        Section
      </div>
      <h2
        style={{
          fontFamily: tokens.fonts.body,
          fontWeight: 700,
          fontSize: "clamp(22px, 3vw, 28px)",
          letterSpacing: "-0.5px",
          lineHeight: 1.25,
          color: tokens.colors.text,
          margin: 0,
          paddingBottom: "16px",
          borderBottom: `1px solid ${tokens.colors.borderAccent}`,
        }}
      >
        {children}
      </h2>
    </div>
  );
}
