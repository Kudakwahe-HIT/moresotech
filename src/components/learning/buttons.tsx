"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Award, BellPlus, BellRing, Check, CheckCircle2, LoaderCircle, LogIn, Play, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";
import { enrollInCourse, completeLesson } from "@/app/dashboard/courses/actions";
import { setWebinarRegistration } from "@/app/dashboard/webinars/actions";
import { cn } from "@/lib/utils";

const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark disabled:opacity-70";

/** Enroll (free) or request enrollment (paid, until online payments launch). */
export function EnrollButton({ courseId, free, priceLabel }: { courseId: string; free: boolean; priceLabel: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={primary}
      onClick={() =>
        startTransition(async () => {
          const result = await enrollInCourse(courseId);
          if (result.error) toast.error(result.error);
          else if (free) toast.success("You're enrolled!", { description: "Start with the first lesson whenever you're ready." });
          else toast.success("Request received", { description: "Our team will contact you to arrange payment, then unlock the course." });
        })
      }
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : free ? <Play className="size-4" /> : <Sparkles className="size-4" />}
      {free ? "Enroll for free" : `Request enrollment · ${priceLabel}`}
    </button>
  );
}

/** "Mark complete" in the lesson player; goes to the next lesson, or celebrates the certificate. */
export function CompleteLessonButton({ lessonId, done, nextHref }: { lessonId: string; done: boolean; nextHref: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [certificate, setCertificate] = useState<string | null>(null);

  if (certificate) {
    return (
      <Link href={`/dashboard/certificates/${certificate}`} className={cn(primary, "bg-emerald-600 hover:bg-emerald-700")}>
        <Award className="size-4" /> View your certificate
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      className={cn(primary, done && !nextHref && "bg-emerald-600 hover:bg-emerald-700")}
      onClick={() => {
        if (done && nextHref) return router.push(nextHref);
        startTransition(async () => {
          const result = await completeLesson(lessonId);
          if (result.error) return void toast.error(result.error);
          if (result.certificateCode) {
            toast.success("Course complete! 🎓", { description: "Your certificate is ready." });
            setCertificate(result.certificateCode);
          } else if (nextHref) {
            router.push(nextHref);
          } else {
            toast.success("Lesson complete");
          }
        });
      }}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : done ? <Check className="size-4" /> : <CheckCircle2 className="size-4" />}
      {done ? (nextHref ? "Next lesson" : "Completed") : nextHref ? "Complete & continue" : "Complete course"}
    </button>
  );
}

/** Register / unregister, and "Join" once the session is open (the link is fetched server-side). */
export function WebinarActions({
  webinarId,
  registered,
  allowed,
  canJoin,
  past,
  recordingUrl,
  courseSlug,
}: {
  webinarId: string;
  registered: boolean;
  allowed: boolean;
  canJoin: boolean;
  past: boolean;
  recordingUrl: string | null;
  courseSlug: string | null;
}) {
  const [pending, startTransition] = useTransition();

  if (past) {
    return recordingUrl && allowed ? (
      <a href={recordingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        <Video className="size-4" /> Watch recording
      </a>
    ) : (
      <span className="text-sm text-slate-400">No recording</span>
    );
  }

  if (!allowed) {
    return courseSlug ? (
      <Link href={`/dashboard/courses/${courseSlug}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
        Enroll to attend
      </Link>
    ) : null;
  }

  if (registered && canJoin) {
    return (
      <a href={`/api/webinars/${webinarId}/join`} target="_blank" rel="noopener" className={cn(primary, "h-10 bg-red-600 shadow-[0_8px_20px_-6px_rgba(220,38,38,0.55)] hover:bg-red-700")}>
        <LogIn className="size-4" /> Join live room
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setWebinarRegistration(webinarId, !registered);
          if (result.error) toast.error(result.error);
          else toast.success(registered ? "Registration cancelled" : "You're registered", registered ? undefined : { description: "The join button appears 15 minutes before it starts." });
        })
      }
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-70",
        registered ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-[#0f1b2d] text-white hover:bg-[#1a2a42]",
      )}
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : registered ? <BellRing className="size-4" /> : <BellPlus className="size-4" />}
      {registered ? "Registered" : "Register"}
    </button>
  );
}
