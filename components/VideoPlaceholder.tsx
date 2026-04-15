interface VideoPlaceholderProps {
  src?: string | null;
  label: string;
  duration?: string;
  orientation?: "horizontal" | "vertical";
  accentColor?: "orange" | "green";
  instagramUrl?: string;
}

export default function VideoPlaceholder({
  src = null,
  label,
  duration,
  orientation = "horizontal",
  accentColor = "orange",
  instagramUrl,
}: VideoPlaceholderProps) {
  const isOrange = accentColor === "orange";
  const aspectClass = orientation === "horizontal" ? "aspect-video" : "aspect-[9/16]";
  const playBg = isOrange ? "bg-accent/15" : "bg-[rgba(92,255,126,0.15)]";
  const playBorder = isOrange
    ? "border-l-[#F5A623]"
    : "border-l-[#5cff7e]";
  const cardBg = isOrange ? "bg-bg-card border-border" : "bg-[#111] border-white/[0.06]";
  const labelColor = isOrange ? "text-text-secondary" : "text-[#9ca3af]";
  const durationColor = isOrange ? "text-text-dim" : "text-[#555]";
  const linkColor = isOrange ? "text-accent" : "text-[#5cff7e]";

  if (src) {
    return (
      <div className={`${cardBg} rounded-2xl overflow-hidden border`}>
        <video
          src={src}
          poster=""
          playsInline
          muted
          loop
          controls
          className={`w-full ${aspectClass} object-cover`}
        />
        {label && (
          <div className="px-4 py-3 flex items-center justify-between">
            <span className={`text-xs font-medium ${labelColor}`}>{label}</span>
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs ${linkColor} hover:underline`}
              >
                Watch on Instagram &rarr;
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${cardBg} rounded-2xl ${aspectClass} flex items-center justify-center relative border`}>
      <div className="text-center px-4">
        <div className={`w-12 h-12 ${playBg} rounded-full flex items-center justify-center mx-auto mb-3`}>
          <div className={`w-0 h-0 border-l-[14px] ${playBorder} border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent ml-1`} />
        </div>
        <div className={`text-xs font-medium ${labelColor}`}>{label}</div>
        {duration && (
          <div className={`text-[11px] ${durationColor} mt-1`}>{duration}</div>
        )}
      </div>
      {instagramUrl && (
        <div className="absolute bottom-3 right-3">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] ${linkColor} hover:underline`}
          >
            Watch on Instagram &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
