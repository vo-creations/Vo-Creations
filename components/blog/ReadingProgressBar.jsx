"use client";
import { useScrollProgress } from "./hooks/useScrollProgress";
import { tokens } from "./tokens";

export default function ReadingProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: "3px",
        background: tokens.colors.accent,
        zIndex: 9999,
        transition: "width 0.1s linear",
        boxShadow: `0 0 8px ${tokens.colors.accentGlow}`,
      }}
    />
  );
}
