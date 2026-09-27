import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Plus, Users, Video } from "lucide-react";
import { LocalTime } from "@/components/learning/time";
import { formatDuration } from "@/lib/learning-rules";
import { listWebinarsForAdmin } from "@/lib/webinars";
import { cn } from "@/lib/utils";
import { SavedToast } from "../scholarships/saved-toast";
import { WebinarRowActions } from "./webinar-row-actions";

export const metadata: Metadata = {
  title: "Webinars | Back office",
};

export default async function AdminWebinarsPage({ searchParams }: PageProps<"/admin/webinars">) {
  const { saved } = await searchParams;
  const [upcoming, past] = await Promise.all([listWebinarsForAdmin("upcoming"), listWebinarsForAdmin("past")]);

  return (
    <div className="space-y-6">
      <SavedToast title={saved ? "Students can now see it" : undefined} label="Webinar saved" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Webinars</h2>
          <p className="mt-1 text-sm text-slate-500">Schedule live sessions. Join links stay private until the room opens.</p>
        </div>
        <Link href="/admin/webinars/new" className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-auto">
          <Plus className="size-4" /> Schedule webinar
        </Link>
      </div>

      <WebinarTable title="Upcoming" rows={upcoming} empty="No upcoming sessions. Schedule one to get students registering." />
      {past.length > 0 && <WebinarTable title="Past" rows={past} empty="" />}
    </div>
  );
}

function WebinarTable({ title, rows, empty }: { title: string; rows: Awaited<ReturnType<typeof listWebinarsForAdmin>>; empty: string }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ webinar: w, courseTitle, registrations }) => (
              <li key={w.id} className={cn("flex flex-wrap items-center gap-4 px-6 py-4", w.cancelled && "opacity-60")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Video className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {w.title}
                    {w.cancelled && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Cancelled</span>}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <LocalTime iso={w.startsAt.toISOString()} />
                    <span>· {formatDuration(w.durationMinutes)}</span>
                    <span>· {w.hostName}</span>
                    {w.access === "enrolled" && (
                      <span className="inline-flex items-center gap-1 text-violet-700">
                        · <Lock className="size-3" /> {courseTitle ?? "Course students"}
                      </span>
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <Users className="size-4 text-slate-400" /> {registrations}
                </span>
                <WebinarRowActions id={w.id} title={w.title} cancelled={w.cancelled} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}
