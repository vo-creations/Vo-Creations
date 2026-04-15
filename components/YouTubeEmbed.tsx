"use client";

import { useState } from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  watchUrl?: string;
}

export default function YouTubeEmbed({
  videoId,
  title,
  watchUrl,
}: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const url = watchUrl || `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div>
      <div
        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-bg-card border border-border cursor-pointer group"
        onClick={() => setLoaded(true)}
      >
        {loaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title || "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
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
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <div className="w-0 h-0 border-l-[20px] border-l-[#0a0a0a] border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
              </div>
            </div>
          </>
        )}
      </div>
      {(title || watchUrl) && (
        <div className="flex items-center justify-between mt-2 px-1">
          {title && (
            <span className="text-xs text-text-secondary font-medium">{title}</span>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-dim hover:text-text-secondary transition-colors"
          >
            Watch on YouTube &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
