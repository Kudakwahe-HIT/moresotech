import type { Metadata } from "next";
import { CalendarClock, CircleAlert, Clock, Lock, UserRound, Users, Video } from "lucide-react";
import { WebinarActions } from "@/components/learning/buttons";
import { Countdown, LocalTime } from "@/components/learning/time";
import { requireRole } from "@/lib/auth";
import { formatDuration, JOIN_OPENS_MIN_BEFORE, webinarWindow } from "@/lib/learning-rules";
import { listWebinarsForStudent, type PublicWebinar } from "@/lib/webinars";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Webinars | MoreSo Tech",
};

const ERRORS: Record<string, string> = {
  register: "Register for the session first, then use Join.",
  access: "This session is only for students enrolled in its course.",
  early: `The live room opens ${JOIN_OPENS_MIN_BEFORE} minutes before the session starts.`,
};

export default async function WebinarsPage({ searchParams }: PageProps<"/dashboard/webinars">) {
  const profile = await requireRole("student", "instructor", "admin");
  const { error } = await searchParams;
  const { upcoming, past } = await listWebinarsForStudent(profile.id);
  const errorMessage = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Live webinars</h2>
        <p className="mt-1 text-sm text-slate-500">Learn from scholarship winners and admissions experts. Times are shown in your timezone.</p>
      </div>

      {errorMessage && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
          <CircleAlert className="size-4 shrink-0" /> {errorMessage}
        </p>
      )}

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Upcoming</h3>
        {upcoming.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {upcoming.map((w) => (
              <WebinarCard key={w.id} webinar={w} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <Video className="size-7" />
            </div>
            <h4 className="mt-4 text-base font-bold text-slate-900">No upcoming sessions</h4>
            <p className="mt-1 max-w-sm text-sm text-slate-500">New webinars are announced regularly. We&apos;ll show them here.</p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Past sessions</h3>
          <div className="grid gap-5 lg:grid-cols-2">
            {past.map((w) => (
              <WebinarCard key={w.id} webinar={w} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function WebinarCard({ webinar: w }: { webinar: PublicWebinar }) {
  const win = webinarWindow(w.startsAt, w.durationMinutes);
  const iso = w.startsAt.toISOString();
  return (
    <article className={cn("flex flex-col rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1", win.live ? "ring-red-200" : "ring-transparent")}>
      <div className="flex items-start gap-4">
        <div className={cn("flex w-16 shrink-0 flex-col items-center rounded-2xl py-2.5 text-center", win.past ? "bg-slate-100 text-slate-500" : "bg-[#0f1b2d] text-white")}>
          <span className="text-[0.65rem] font-bold uppercase tracking-wider opacity-80">
            <LocalTime iso={iso} format="date" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {!win.past && (
              <span className={cn("rounded-full px-2.5 py-0.5", win.live ? "bg-red-50" : "bg-brand-orange/10 text-brand-orange-dark")}>
                <Countdown iso={iso} durationMinutes={w.durationMinutes} />
              </span>
            )}
            {w.access === "enrolled" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-violet-700">
                <Lock className="size-3" /> {w.courseTitle ?? "Course students"}
              </span>
            )}
          </div>
          <h4 className="mt-2 font-bold leading-snug text-slate-900">{w.title}</h4>
          {w.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{w.description}</p>}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="size-3.5" /> <LocalTime iso={iso} format="time" />
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {formatDuration(w.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3.5" /> {w.hostName}
            </span>
            {w.registrations > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5" /> {w.registrations} registered
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
        <WebinarActions
          webinarId={w.id}
          registered={w.registered}
          allowed={w.allowed}
          canJoin={win.canJoin}
          past={win.past}
          recordingUrl={w.recordingUrl}
          courseSlug={w.courseSlug}
        />
      </div>
    </article>
  );
}
