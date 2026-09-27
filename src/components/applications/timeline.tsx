import type { ApplicationEvent } from "@/db/schema";
import { formatDateTime } from "@/lib/application-rules";
import { cn } from "@/lib/utils";

type TimelineEvent = { event: ApplicationEvent; actorFirstName: string | null; actorRole: string | null };

const DOT: Record<string, string> = {
  document_verified: "bg-emerald-500",
  approved: "bg-emerald-500",
  document_revision: "bg-red-500",
  changes_requested: "bg-brand-orange",
  rejected: "bg-red-500",
  submitted: "bg-violet-500",
  under_review: "bg-amber-500",
};

/** Newest-first activity history. Staff actions are attributed to "MoreSo Tech" for students. */
export function Timeline({ events, audience }: { events: TimelineEvent[]; audience: "student" | "admin" }) {
  if (!events.length) return <p className="text-sm text-slate-500">No activity yet.</p>;
  return (
    <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
      {events.map(({ event, actorFirstName, actorRole }) => {
        const byStaff = actorRole === "admin" || actorRole === "instructor";
        const who = byStaff ? (audience === "admin" ? `${actorFirstName ?? "Admin"} (staff)` : "MoreSo Tech") : audience === "admin" ? (actorFirstName ?? "Student") : "You";
        return (
          <li key={event.id} className="relative pl-7">
            <span className={cn("absolute left-0 top-1.5 size-[11px] rounded-full ring-4 ring-white", DOT[event.type] ?? "bg-slate-300")} />
            <p className="text-sm text-slate-800">{event.message}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {who} · {formatDateTime(event.createdAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
