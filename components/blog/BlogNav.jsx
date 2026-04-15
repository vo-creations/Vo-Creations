"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { tokens } from "./tokens";

export default function BlogNav({ articleTitle, readingTime }) {
  const isArticle = !!articleTitle;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isArticle) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isArticle]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "56px",
        background: "rgba(15, 13, 11, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${tokens.colors.border}`,
      }}
    >
      {/* Left: brand or back link */}
      {isArticle ? (
        <Link
          href="/blog"
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "13px",
            fontWeight: 600,
            color: tokens.colors.textSecondary,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = tokens.colors.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = tokens.colors.textSecondary)}
        >
          ← Blog
        </Link>
      ) : (
        <Link
          href="/"
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: "16px",
            fontWeight: 800,
            color: tokens.colors.text,
            textDecoration: "none",
            letterSpacing: "-0.3px",
            flexShrink: 0,
          }}
        >
          Vo{" "}
          <span style={{ color: tokens.colors.accent }}>Creations</span>
        </Link>
      )}

      {/* Center: page title or article title (fades in on scroll for articles) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "50%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontFamily: tokens.fonts.body,
          fontSize: "14px",
          fontWeight: 600,
          color: tokens.colors.text,
          opacity: isArticle ? (scrolled ? 1 : 0) : 1,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      >
        {isArticle ? articleTitle : "Blog"}
      </div>

      {/* Right: reading time (articles) or back to main site (index) */}
      {isArticle ? (
        <div
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: tokens.colors.textDim,
            flexShrink: 0,
          }}
        >
          {readingTime}
        </div>
      ) : (
        <Link
          href="/"
          style={{
            fontFamily: tokens.fonts.mono,
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: tokens.colors.textDim,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "color 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = tokens.colors.accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = tokens.colors.textDim)}
        >
          vocreations.com ↗
        </Link>
      )}
    </nav>
  );
}
