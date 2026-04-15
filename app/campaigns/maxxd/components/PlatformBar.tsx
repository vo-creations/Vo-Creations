import type { Platform } from "../data";
import { formatNumber } from "../data";

export function PlatformBar({ platform, maxViews }: { platform: Platform; maxViews: number }) {
  const pct = (platform.views / maxViews) * 100;

  return (
    <div className="flex items-center gap-4 group">
      <span className="font-outfit text-sm font-medium text-text w-24 shrink-0">
        {platform.name}
      </span>
      <div className="flex-1 h-8 bg-bg-elevated rounded overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-accent/80 to-accent rounded transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right shrink-0 w-28">
        <span className="font-mono text-sm font-semibold text-text">{formatNumber(platform.views)}</span>
        <span className="font-mono text-[11px] text-text-secondary ml-2">{platform.posts}p</span>
      </div>
    </div>
  );
}
