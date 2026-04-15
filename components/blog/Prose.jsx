"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function Prose({ children }) {
  const [ref, inView] = useInView();

  return (
    <>
      <style>{`
        .blog-prose p { margin: 0 0 1.4em 0; }
        .blog-prose p:last-child { margin-bottom: 0; }
        .blog-prose em { font-style: italic; }
      `}</style>
      <div
        ref={ref}
        className="blog-prose"
        style={{
          maxWidth: tokens.prose.maxWidth,
          margin: "0 auto",
          padding: "0 24px",
          fontFamily: tokens.fonts.body,
          fontSize: tokens.prose.fontSize,
          lineHeight: tokens.prose.lineHeight,
          color: tokens.colors.text,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          marginBottom: "32px",
        }}
      >
        {children}
      </div>
    </>
  );
}
