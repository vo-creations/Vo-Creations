"use client";
import { tokens } from "./tokens";
import { useInView } from "./hooks/useInView";

export default function XPostEmbed({ url, author, handle, date, content, metrics, compact, avatar }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      style={{
        maxWidth: compact ? "100%" : tokens.prose.maxWidth,
        margin: compact ? "0" : "48px auto",
        padding: compact ? "0" : "0 24px",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          background: tokens.colors.surface,
          border: `1px solid ${tokens.colors.border}`,
          borderRadius: "16px",
          padding: "28px",
          transition: "border-color 0.3s ease, transform 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.borderAccent;
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = tokens.colors.border;
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Header: avatar + name + X logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={avatar || "/videos/team-thienvu.jpg"}
              alt={author}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <div style={{
                fontFamily: tokens.fonts.body,
                fontWeight: 700,
                fontSize: "15px",
                color: tokens.colors.text,
                lineHeight: 1.3,
              }}>
                {author}
              </div>
              <div style={{
                fontFamily: tokens.fonts.body,
                fontSize: "13px",
                color: tokens.colors.textDim,
              }}>
                {handle}
              </div>
            </div>
          </div>
          <svg viewBox="0 0 24 24" fill={tokens.colors.textSecondary} width="20" height="20">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>

        {/* Post content */}
        <div style={{
          fontFamily: tokens.fonts.body,
          fontSize: "16px",
          lineHeight: 1.65,
          color: tokens.colors.text,
          marginBottom: "20px",
          whiteSpace: "pre-line",
        }}>
          {content}
        </div>

        {/* Date */}
        <div style={{
          fontFamily: tokens.fonts.body,
          fontSize: "13px",
          color: tokens.colors.textDim,
          paddingBottom: "16px",
          borderBottom: `1px solid ${tokens.colors.border}`,
          marginBottom: "16px",
        }}>
          {date}
        </div>

        {/* Metrics */}
        {metrics && (
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  fontFamily: tokens.fonts.body,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: tokens.colors.text,
                }}>
                  {m.value}
                </span>
                <span style={{
                  fontFamily: tokens.fonts.body,
                  fontSize: "13px",
                  color: tokens.colors.textDim,
                }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* View on X hint */}
        <div style={{
          marginTop: "16px",
          fontFamily: tokens.fonts.mono,
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: tokens.colors.textDim,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          View on X
          <span style={{ fontSize: "13px" }}>&#8599;</span>
        </div>
      </a>
    </div>
  );
}
