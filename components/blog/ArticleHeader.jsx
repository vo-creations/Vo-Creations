"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function ArticleHeader({ title, subtitle, meta, author }) {
  const [ref, inView] = useInView();

  const base = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0)" : "translateY(16px)",
    transition: "opacity 0.5s ease, transform 0.5s ease",
  };

  return (
    <header
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "0 auto",
        padding: "48px 24px 48px",
        textAlign: "center",
      }}
    >
      {meta && (
        <div
          style={{
            ...base,
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: tokens.colors.accent,
            marginBottom: "20px",
          }}
        >
          {meta}
        </div>
      )}
      <h1
        style={{
          ...base,
          transitionDelay: "0.1s",
          fontFamily: tokens.fonts.display,
          fontWeight: 900,
          fontSize: "clamp(32px, 5vw, 48px)",
          letterSpacing: "-2px",
          lineHeight: 1.1,
          color: tokens.colors.text,
          margin: "0 0 16px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            ...base,
            transitionDelay: "0.2s",
            fontFamily: tokens.fonts.body,
            fontSize: "18px",
            color: tokens.colors.textSecondary,
            lineHeight: 1.5,
            margin: "0 0 20px",
          }}
        >
          {subtitle}
        </p>
      )}
      {author && (
        <p
          style={{
            ...base,
            transitionDelay: "0.3s",
            fontFamily: tokens.fonts.body,
            fontSize: "14px",
            color: tokens.colors.textDim,
            margin: 0,
          }}
        >
          By {author}
        </p>
      )}
    </header>
  );
}
