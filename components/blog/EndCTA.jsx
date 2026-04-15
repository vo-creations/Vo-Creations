"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function EndCTA({ headline, body, buttonText, buttonHref }) {
  const [ref, inView] = useInView();

  return (
    <section
      ref={ref}
      style={{
        background: tokens.colors.surfaceElevated,
        padding: "80px 24px",
        textAlign: "center",
        marginTop: "64px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        <h2
          style={{
            fontFamily: tokens.fonts.display,
            fontWeight: 800,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            color: tokens.colors.text,
            marginBottom: "16px",
          }}
        >
          {headline}
        </h2>
        <p
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: "17px",
            lineHeight: 1.65,
            color: tokens.colors.textSecondary,
            marginBottom: "32px",
          }}
        >
          {body}
        </p>
        <a
          href={buttonHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: tokens.colors.accent,
            color: tokens.colors.bg,
            fontFamily: tokens.fonts.body,
            fontWeight: 700,
            fontSize: "16px",
            padding: "16px 36px",
            borderRadius: "9999px",
            textDecoration: "none",
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 0 32px ${tokens.colors.borderAccent}`;
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {buttonText} <span>&#8599;</span>
        </a>
      </div>
    </section>
  );
}
