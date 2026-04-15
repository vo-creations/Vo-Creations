"use client";

import { useState } from "react";

interface WistiaEmbedProps {
  videoId: string;
  thumbnailUrl: string;
  title?: string;
  aspect?: "landscape" | "portrait";
}

export default function WistiaEmbed({
  videoId,
  thumbnailUrl,
  title,
  aspect = "landscape",
}: WistiaEmbedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <div
        className={`relative w-full ${
          aspect === "portrait" ? "aspect-[9/16]" : "aspect-video"
        } rounded-2xl overflow-hidden bg-bg-card border border-border cursor-pointer group`}
        onClick={() => setLoaded(true)}
      >
        {loaded ? (
          <iframe
            src={`https://fast.wistia.net/embed/iframe/${videoId}?autoPlay=true&controlsVisibleOnLoad=false`}
            title={title || "Video"}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            style={{ border: 0 }}
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={title || "Video thumbnail"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <div className="w-0 h-0 border-l-[18px] border-l-[#0a0a0a] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
              </div>
            </div>
          </>
        )}
      </div>
      {title && (
        <div className="mt-2 px-1">
          <span className="text-xs text-text-secondary font-medium">{title}</span>
        </div>
      )}
    </div>
  );
}
