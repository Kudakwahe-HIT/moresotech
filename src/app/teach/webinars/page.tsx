import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Lock, LogIn, Plus, Users, Video } from "lucide-react";
import { Countdown, LocalTime } from "@/components/learning/time";
import { WebinarRowActions } from "@/app/admin/webinars/webinar-row-actions";
import { SavedToast } from "@/app/admin/scholarships/saved-toast";
import { requireRole } from "@/lib/auth";
import { formatDuration } from "@/lib/learning-rules";
import { listTaughtCourses, listWebinarsForInstructor } from "@/lib/webinars";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sessions | Teaching",
};

type Rows = Awaited<ReturnType<typeof listWebinarsForInstructor>>;

export default async function TeachWebinarsPage({ searchParams }: PageProps<"/teach/webinars">) {
  const profile = await requireRole("instructor", "admin");
  const { saved } = await searchParams;
  const [upcoming, past, taught] = await Promise.all([
    listWebinarsForInstructor(profile.id, "upcoming"),
    listWebinarsForInstructor(profile.id, "past"),
    listTaughtCourses(profile.id),
  ]);

  return (
    <div className="space-y-6">
      <SavedToast title={saved ? "Your students can now see it" : undefined} label="Session saved" />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sessions</h2>
          <p className="mt-1 text-sm text-slate-500">Schedule live classes for the courses you teach. Join links stay private until the room opens.</p>
        </div>
        {taught.length > 0 && (
          <Link
            href="/teach/webinars/new"
            className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-auto"
          >
            <Plus className="size-4" /> Schedule session
          </Link>
        )}
      </div>

      <SessionList
        title="Upcoming"
        rows={upcoming}
        empty={
          taught.length
            ? "No upcoming sessions. Schedule one and your students will see it on their dashboard."
            : "Once an admin assigns you a course, you can schedule live sessions for it here."
        }
      />
      {past.length > 0 && <SessionList title="Past" rows={past} past />}
    </div>
  );
}

function SessionList({ title, rows, empty, past }: { title: string; rows: Rows; empty?: string; past?: boolean }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ webinar: w, courseTitle, registrations }) => (
              <li key={w.id} className={cn("flex flex-wrap items-center gap-4 px-6 py-4", w.cancelled && "opacity-60")}>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0f1b2d] text-white">
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
                    <span>· {courseTitle}</span>
                    {w.access === "enrolled" ? (
                      <span className="inline-flex items-center gap-1 text-violet-700">
                        · <Lock className="size-3" /> Course students
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        · <Globe className="size-3" /> Open to everyone
                      </span>
                    )}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600" title="Registered students">
                  <Users className="size-4 text-slate-400" /> {registrations}
                </span>
                {!past && !w.cancelled && (
                  <>
                    <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange-dark">
                      <Countdown iso={w.startsAt.toISOString()} durationMinutes={w.durationMinutes} />
                    </span>
                    {/* Staff can always open the room (the join route skips the student checks for them). */}
                    <a
                      href={`/api/webinars/${w.id}/join`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f1b2d] px-3 text-sm font-semibold text-white transition hover:bg-[#1a2a42]"
                    >
                      <LogIn className="size-4" /> Open room
                    </a>
                  </>
                )}
                <WebinarRowActions id={w.id} title={w.title} cancelled={w.cancelled} area="teach" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Video className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No upcoming sessions</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">{empty}</p>
          </div>
        )}
      </div>
    </section>
  );
}
