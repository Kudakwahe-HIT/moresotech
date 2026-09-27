"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, LoaderCircle, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { startApplication, submitApplication } from "@/app/dashboard/applications/actions";
import { cn } from "@/lib/utils";

/** "Start application" on a scholarship page. Redirects to the new application on success. */
export function StartApplicationButton({ scholarshipId, existingId }: { scholarshipId: string; existingId?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (existingId) return router.push(`/dashboard/applications/${existingId}`);
        startTransition(async () => {
          const result = await startApplication(scholarshipId);
          if (result?.error) toast.error(result.error);
        });
      }}
      className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark disabled:opacity-70"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : <ClipboardCheck className="size-4" />}
      {existingId ? "Continue application" : "Start application"}
    </button>
  );
}

/** Submit for assessment. Locked (with the reason) until every requirement is verified. */
export function SubmitApplicationButton({ applicationId, ready, remaining }: { applicationId: string; ready: boolean; remaining: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        disabled={!ready || pending}
        onClick={() =>
          startTransition(async () => {
            const result = await submitApplication(applicationId);
            if (result.error) toast.error(result.error);
            else toast.success("Application submitted", { description: "We'll let you know as soon as a reviewer picks it up." });
          })
        }
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition",
          ready
            ? "bg-brand-orange text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] hover:bg-brand-orange-dark"
            : "cursor-not-allowed bg-white/10 text-white/60 ring-1 ring-white/15",
        )}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : ready ? <Send className="size-4" /> : <Lock className="size-4" />}
        Submit for assessment
      </button>
      {!ready && (
        <p className="text-xs text-slate-400">
          {remaining} {remaining === 1 ? "item needs" : "items need"} to be verified first
        </p>
      )}
    </div>
  );
}
