import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { deadlineInfo } from "@/lib/scholarship-labels";

const TONES = {
  closed: "bg-slate-100 text-slate-500",
  urgent: "bg-red-50 text-red-600 ring-1 ring-red-100",
  soon: "bg-brand-orange/10 text-brand-orange-dark ring-1 ring-brand-orange/15",
  open: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  none: "bg-slate-100 text-slate-600",
};

/** "12 days left": green when there's time, orange within 30 days, red within a week. */
export function DeadlineChip({ deadline, className }: { deadline: string | null; className?: string }) {
  const info = deadlineInfo(deadline);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        TONES[info.tone],
        className,
      )}
    >
      <Timer className="size-3.5" />
      {info.label}
    </span>
  );
}
