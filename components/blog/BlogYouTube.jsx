"use client";
import { useState } from "react";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function BlogYouTube({ videoId, caption }) {
  const [ref, inView] = useInView();
  const [playing, setPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

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
          borderRadius: "16px",
          overflow: "hidden",
          border: `1px solid ${tokens.colors.border}`,
          position: "relative",
          aspectRatio: "16/9",
          background: tokens.colors.surface,
          cursor: playing ? "default" : "pointer",
        }}
        onClick={() => !playing && setPlaying(true)}
      >
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={caption || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={caption || "Video thumbnail"}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: tokens.colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 24px ${tokens.colors.accentGlow}`,
                }}
              >
                <span style={{ fontSize: "24px", color: tokens.colors.bg, marginLeft: "4px" }}>▶</span>
              </div>
            </div>
          </>
        )}
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
