"use client";

import { useEffect, useRef, useState } from "react";

interface InstagramEmbedProps {
  url: string;
  label?: string;
}

export default function InstagramEmbed({ url, label }: InstagramEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaded) return;
    // Load IG embed script if not already present
    if (!(window as any).instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => (window as any).instgrm?.Embeds?.process();
    } else {
      (window as any).instgrm.Embeds.process();
    }
  }, [loaded]);

  // Extract the reel/post shortcode for the embed preview
  const embedUrl = url.replace(/\/$/, "") + "/embed";

  if (!loaded) {
    return (
      <div
        className="bg-bg-card rounded-2xl aspect-[9/16] relative border border-border overflow-hidden group"
      >
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full pointer-events-none"
          loading="lazy"
          title={label || "Instagram preview"}
          style={{ border: 0 }}
        />
        <div
          onClick={() => setLoaded(true)}
          className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors cursor-pointer flex items-end justify-center pb-4"
        >
          {label && (
            <span className="text-xs text-white font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="rounded-2xl overflow-hidden">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={url}
        style={{
          background: "#1A1714",
          border: 0,
          borderRadius: "16px",
          margin: 0,
          maxWidth: "100%",
          minWidth: "240px",
          width: "100%",
        }}
      />
      {label && (
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-xs text-text-secondary font-medium">{label}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-dim hover:text-text-secondary transition-colors"
          >
            View on Instagram &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
