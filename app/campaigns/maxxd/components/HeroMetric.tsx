import { formatNumber } from "../data";

interface HeroMetricProps {
  value: number;
  label: string;
  caption: string;
}

export function HeroMetric({ value, label, caption }: HeroMetricProps) {
  return (
    <div className="flex flex-col items-center text-center px-4 py-6 sm:py-8">
      <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold text-accent tracking-tight">
        {formatNumber(value)}
      </span>
      <span className="font-outfit text-sm sm:text-base font-medium text-text mt-2">
        {label}
      </span>
      <span className="font-mono text-[11px] text-text-secondary mt-1">
        {caption}
      </span>
    </div>
  );
}
