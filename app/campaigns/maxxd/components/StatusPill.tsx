import type { CreatorStatus } from "../data";

const statusConfig: Record<CreatorStatus, { label: string; bg: string; text: string; dot: string }> = {
  ON_TRACK: { label: "ON TRACK", bg: "bg-green/10", text: "text-green", dot: "bg-green" },
  WATCH: { label: "WATCH", bg: "bg-yellow-400/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  SLOW: { label: "SLOW", bg: "bg-red/10", text: "text-red", dot: "bg-red" },
};

export function StatusPill({ status }: { status: CreatorStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wider ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
