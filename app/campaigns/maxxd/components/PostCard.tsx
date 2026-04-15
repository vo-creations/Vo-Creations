import type { TopPost } from "../data";
import { formatNumber } from "../data";
import { PlatformIconByName } from "./PlatformIcon";

export function PostCard({ post }: { post: TopPost }) {
  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-bg-card border border-border rounded-xl p-5 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(245,166,35,0.06)] transition-all duration-200 group"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] font-bold text-accent/60">#{post.rank}</span>
        <PlatformIconByName platform={post.platform} className="w-3.5 h-3.5 text-text-secondary" />
        <span className="font-mono text-[11px] text-text-secondary">{post.creator}</span>
      </div>

      <p className="text-sm text-text font-sans leading-snug mb-3 line-clamp-2 group-hover:text-accent/90 transition-colors">
        {post.title}
      </p>

      <div className="flex items-center gap-3 font-mono text-[11px] text-text-secondary">
        <span>{formatNumber(post.views)} views</span>
        <span className="text-text-dim">·</span>
        <span>{formatNumber(post.likes)} likes</span>
        <span className="text-text-dim">·</span>
        <span>{post.engagement}%</span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <span className="font-mono text-[10px] text-text-dim">{post.date}</span>
        <span className="text-[11px] text-accent/60 group-hover:text-accent transition-colors">
          View post &rarr;
        </span>
      </div>
    </a>
  );
}
