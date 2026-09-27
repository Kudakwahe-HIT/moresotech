"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleSavedScholarship } from "@/app/dashboard/scholarships/actions";

type SaveButtonProps = {
  scholarshipId: string;
  title: string;
  saved: boolean;
  variant?: "icon" | "full";
  /** Light styling for use on dark backgrounds (the detail page hero). */
  onDark?: boolean;
};

/** Bookmark toggle. Flips instantly (optimistic) and rolls back with a toast if saving fails. */
export function SaveButton({ scholarshipId, title, saved, variant = "icon", onDark = false }: SaveButtonProps) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [, startTransition] = useTransition();

  function toggle(event: React.MouseEvent) {
    // Cards are links; don't open the scholarship when clicking the bookmark.
    event.preventDefault();
    event.stopPropagation();
    const next = !optimisticSaved;
    startTransition(async () => {
      setOptimisticSaved(next);
      try {
        await toggleSavedScholarship(scholarshipId, next);
        toast.success(next ? "Saved to your list" : "Removed from saved", { description: title });
      } catch {
        toast.error("Couldn't update your saved list. Please try again.");
      }
    });
  }

  const Icon = optimisticSaved ? BookmarkCheck : Bookmark;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={optimisticSaved}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
          onDark
            ? optimisticSaved
              ? "border-white/25 bg-white text-[#0f1b2d] hover:bg-slate-100"
              : "border-white/20 bg-white/10 text-white hover:bg-white/15"
            : optimisticSaved
              ? "border-brand-blue/20 bg-brand-blue/5 text-brand-blue hover:bg-brand-blue/10"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        )}
      >
        <Icon className="size-4" />
        {optimisticSaved ? "Saved" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticSaved}
      aria-label={optimisticSaved ? `Remove ${title} from saved` : `Save ${title}`}
      className={cn(
        "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border transition",
        optimisticSaved
          ? "border-brand-blue/20 bg-brand-blue text-white shadow-[0_6px_14px_-6px_rgba(11,92,156,0.7)]"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
