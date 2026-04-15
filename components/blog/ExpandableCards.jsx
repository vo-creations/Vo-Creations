"use client";
import { useState } from "react";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function ExpandableCards({ cards }) {
  const [ref, inView] = useInView();
  const [expanded, setExpanded] = useState({});

  const toggle = (i) => setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

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
      {cards.map((card, i) => (
        <div
          key={i}
          onClick={() => toggle(i)}
          style={{
            background: tokens.colors.surface,
            border: `1px solid ${expanded[i] ? tokens.colors.borderAccent : tokens.colors.border}`,
            borderRadius: "16px",
            padding: "24px",
            cursor: "pointer",
            transition: "opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease",
            transitionDelay: `${i * 0.1}s`,
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <h4
              style={{
                fontFamily: tokens.fonts.body,
                fontWeight: 600,
                fontSize: "16px",
                color: tokens.colors.text,
                margin: 0,
              }}
            >
              {card.title}
            </h4>
            <span
              style={{
                fontSize: "18px",
                color: tokens.colors.textDim,
                transition: "transform 0.3s ease",
                transform: expanded[i] ? "rotate(180deg)" : "rotate(0)",
                flexShrink: 0,
              }}
            >
              ▾
            </span>
          </div>
          <div
            style={{
              maxHeight: expanded[i] ? "400px" : "0",
              overflow: "hidden",
              transition: "max-height 0.4s ease, margin-top 0.4s ease",
              marginTop: expanded[i] ? "16px" : "0",
            }}
          >
            <p
              style={{
                fontFamily: tokens.fonts.body,
                fontSize: "15px",
                lineHeight: 1.7,
                color: tokens.colors.textSecondary,
                margin: 0,
              }}
            >
              {card.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
