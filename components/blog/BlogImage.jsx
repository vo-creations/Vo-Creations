"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function BlogImage({ src, alt, caption, wide }) {
  const [ref, inView] = useInView();

  return (
    <figure
      ref={ref}
      style={{
        maxWidth: wide ? "900px" : tokens.prose.maxWidth,
        margin: "48px auto",
        padding: "0 24px",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${tokens.colors.border}`,
        }}
      >
        <img
          src={src}
          alt={alt || caption || ""}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption
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
        </figcaption>
      )}
    </figure>
  );
}
