"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function VideoEmbed({ caption }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "48px auto",
        padding: "0 24px",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        style={{
          background: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: "16px",
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: tokens.colors.accentGlow,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "20px", color: tokens.colors.accent, marginLeft: "3px" }}>▶</span>
        </div>
        <span
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "12px",
            fontWeight: 600,
            color: tokens.colors.textDim,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Video coming soon
        </span>
      </div>
      {caption && (
        <p
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: tokens.colors.textDim,
            textAlign: "center",
            marginTop: "12px",
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
