"use client";

import { useState } from "react";

type MiniStat = { value: string; label: string };

interface ResultCardProps {
  company: string;
  tags: string[];
  views: string;
  viewsSub: string;
  quote: string;
  quoteSource: string;
  challenge?: string;
  approach?: string;
  result?: string;
  miniStats?: MiniStat[];
  note?: string;
}

export default function ResultCard({
  company,
  tags,
  views,
  viewsSub,
  quote,
  quoteSource,
  challenge,
  approach,
  result,
  miniStats,
  note,
}: ResultCardProps) {
  const [open, setOpen] = useState(false);
  const expandable = !!(challenge || approach || result);

  return (
    <div
      className={`bg-bg-card rounded-[20px] border border-border overflow-hidden transition-colors hover:border-accent/25 ${expandable ? "cursor-pointer" : ""}`}
      onClick={() => expandable && setOpen(!open)}
    >
      <div className="p-7 pb-5">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="text-[22px] font-extrabold tracking-tight">
              {company}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-text-secondary bg-bg-elevated px-3 py-1 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl md:text-[48px] font-black text-accent tracking-tighter leading-none">
              {views}
              <span className="text-base text-text-secondary font-normal ml-1">
                views
              </span>
            </div>
            <div className="text-xs text-text-dim mt-1 font-medium">
              {viewsSub}
            </div>
          </div>
        </div>
      </div>

      {/* Quote bar */}
      {quote && <div className="px-7 py-5 bg-accent/[0.03] border-t border-border flex gap-3.5 items-start">
        <div className="text-4xl text-accent font-serif leading-none opacity-40 shrink-0 -mt-1">
          &ldquo;
        </div>
        <div>
          <div className="text-sm text-text-secondary leading-relaxed italic">
            {quote}
          </div>
          <div className="text-xs text-text-dim mt-1.5 not-italic font-medium">
            {quoteSource}
          </div>
        </div>
      </div>}

      {/* Expand hint */}
      {expandable && !open && (
        <div className="text-xs text-text-dim px-7 pb-4 font-medium">
          Click for full case study &#8599;
        </div>
      )}

      {/* Expandable detail */}
      {expandable && open && (
        <div className="px-7 pb-7 border-t border-border">
          {challenge && (
            <p className="text-sm text-text-secondary leading-relaxed mt-3.5">
              <strong className="text-text font-semibold">Challenge:</strong>{" "}
              {challenge}
            </p>
          )}
          {approach && (
            <p className="text-sm text-text-secondary leading-relaxed mt-3.5">
              <strong className="text-text font-semibold">Approach:</strong>{" "}
              {approach}
            </p>
          )}
          {result && (
            <p className="text-sm text-text-secondary leading-relaxed mt-3.5">
              <strong className="text-text font-semibold">Result:</strong>{" "}
              {result}
            </p>
          )}
          {miniStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5">
              {miniStats.map((s) => (
                <div
                  key={s.label}
                  className="bg-bg-elevated rounded-[10px] p-3.5 text-center"
                >
                  <div className="text-xl font-extrabold text-accent tracking-tight">
                    {s.value}
                  </div>
                  <div className="text-[10px] text-text-dim uppercase tracking-wide mt-1 font-medium">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simple note (non-expandable cards like Lore) */}
      {note && (
        <div className="px-7 pb-5 text-sm text-text-dim">{note}</div>
      )}
    </div>
  );
}
