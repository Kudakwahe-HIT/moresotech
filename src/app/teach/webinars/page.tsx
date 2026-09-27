import type { Metadata } from "next";
import { LogIn, Users, Video } from "lucide-react";
import { Countdown, LocalTime } from "@/components/learning/time";
import { requireRole } from "@/lib/auth";
import { formatDuration } from "@/lib/learning-rules";
import { listWebinarsForInstructor } from "@/lib/webinars";

export const metadata: Metadata = {
  title: "Sessions | Teaching",
};

export default async function TeachWebinarsPage() {
  const profile = await requireRole("instructor", "admin");
  const rows = await listWebinarsForInstructor(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sessions</h2>
        <p className="mt-1 text-sm text-slate-500">Upcoming live sessions for your courses. Admins schedule them in the back office.</p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <ul className="divide-y divide-slate-100">
            {rows.map(({ webinar: w, courseTitle, registrations }) => (
              <li key={w.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0f1b2d] text-white">
                  <Video className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{w.title}</p>
                  <p className="truncate text-xs text-slate-500">
                    <LocalTime iso={w.startsAt.toISOString()} /> · {formatDuration(w.durationMinutes)} · {courseTitle}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <Users className="size-4 text-slate-400" /> {registrations}
                </span>
                <span className="rounded-full bg-brand-orange/10 px-2.5 py-1 text-xs font-semibold text-brand-orange-dark">
                  <Countdown iso={w.startsAt.toISOString()} durationMinutes={w.durationMinutes} />
                </span>
                {/* Staff can always open the room (the join route skips the student checks for them). */}
                <a href={`/api/webinars/${w.id}/join`} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0f1b2d] px-3 text-sm font-semibold text-white transition hover:bg-[#1a2a42]">
                  <LogIn className="size-4" /> Open room
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Video className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No upcoming sessions</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Sessions linked to your courses will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
