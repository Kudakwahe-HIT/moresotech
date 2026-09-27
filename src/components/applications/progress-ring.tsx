import { cn } from "@/lib/utils";

/** Circular completion meter. `tone="dark"` for use on the navy hero. */
export function ProgressRing({
  percent,
  size = 64,
  stroke = 6,
  tone = "light",
  label,
  className,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  tone?: "light" | "dark";
  label?: string;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const value = Math.max(0, Math.min(100, percent));
  const done = value === 100;

  return (
    <div
      role="img"
      aria-label={label ?? `${value}% complete`}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={tone === "dark" ? "stroke-white/10" : "stroke-slate-100"} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (value / 100) * c}
          className={cn("transition-[stroke-dashoffset] duration-700", done ? "stroke-emerald-500" : "stroke-brand-orange")}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-bold",
          size >= 88 ? "text-xl" : "text-sm",
          tone === "dark" ? "text-white" : "text-slate-900",
        )}
      >
        {value}%
      </span>
    </div>
  );
}
