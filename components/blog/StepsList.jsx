"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function StepsList({ steps }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: tokens.prose.maxWidth,
        margin: "48px auto",
        padding: "0 24px",
      }}
    >
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "20px",
            paddingBottom: i < steps.length - 1 ? "32px" : "0",
            marginBottom: i < steps.length - 1 ? "32px" : "0",
            borderBottom: i < steps.length - 1 ? `1px solid ${tokens.colors.border}` : "none",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
            transitionDelay: `${i * 0.1}s`,
          }}
        >
          <div
            style={{
              fontFamily: tokens.fonts.mono,
              fontSize: "13px",
              fontWeight: 700,
              color: tokens.colors.accent,
              lineHeight: 1.6,
              flexShrink: 0,
              width: "32px",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div
              style={{
                fontFamily: tokens.fonts.body,
                fontWeight: 700,
                fontSize: "17px",
                color: tokens.colors.text,
                marginBottom: "8px",
                lineHeight: 1.4,
              }}
            >
              {step.title}
            </div>
            <p
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: "15px",
                lineHeight: 1.7,
                color: tokens.colors.textSecondary,
                margin: 0,
              }}
            >
              {step.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
