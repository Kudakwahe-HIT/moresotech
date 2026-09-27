"use client";

import { startTransition, useActionState, useEffect, useState, useTransition, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronDown, ChevronUp, CircleAlert, Eye, LoaderCircle, Pencil, Plus, Trash2, UserPlus, Video, X } from "lucide-react";
import { toast } from "sonner";
import type { Enrollment, Lesson, Profile } from "@/db/schema";
import type { ActionResult } from "@/lib/action-result";
import { ENROLLMENT_STATUS, formatDuration } from "@/lib/learning-rules";
import type { FormState, LessonFormValues } from "@/lib/validation/learning";
import { cn } from "@/lib/utils";
import { deleteLesson, enrollByEmail, moveLesson, saveLesson, setEnrollmentStatus } from "../actions";
import { input } from "../course-form";

function useRun() {
  const [pending, start] = useTransition();
  function run(fn: () => Promise<ActionResult>, success?: string) {
    start(async () => {
      try {
        const r = await fn();
        if (r.error) toast.error(r.error);
        else if (success) toast.success(success);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }
  return { pending, run };
}

// ─── Lessons ───────────────────────────────────────────────────────────────

export function LessonsManager({ courseId, lessons }: { courseId: string; lessons: Lesson[] }) {
  const { pending, run } = useRun();
  const [editing, setEditing] = useState<Lesson | "new" | null>(null);

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Lessons</h3>
          <p className="text-sm text-slate-500">{lessons.length ? "Students take them in this order." : "Add the first lesson."}</p>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark">
          <Plus className="size-4" /> Add lesson
        </button>
      </div>

      {lessons.length > 0 && (
        <ol className="divide-y divide-slate-100">
          {lessons.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 px-6 py-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">{l.title}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                  {l.videoUrl && (
                    <span className="inline-flex items-center gap-1">
                      <Video className="size-3" /> Video
                    </span>
                  )}
                  {l.durationMinutes && <span>{formatDuration(l.durationMinutes)}</span>}
                  {l.freePreview && (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <Eye className="size-3" /> Free preview
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton label="Move up" disabled={pending || i === 0} onClick={() => run(() => moveLesson(l.id, "up"))}>
                  <ChevronUp className="size-4" />
                </IconButton>
                <IconButton label="Move down" disabled={pending || i === lessons.length - 1} onClick={() => run(() => moveLesson(l.id, "down"))}>
                  <ChevronDown className="size-4" />
                </IconButton>
                <IconButton label={`Edit ${l.title}`} onClick={() => setEditing(l)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton
                  label={`Delete ${l.title}`}
                  danger
                  disabled={pending}
                  onClick={() => {
                    if (confirm(`Delete "${l.title}"? Student progress on this lesson is removed too.`)) run(() => deleteLesson(l.id), "Lesson deleted");
                  }}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      {editing && <LessonDialog courseId={courseId} lesson={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </section>
  );
}

function LessonDialog({ courseId, lesson, onClose }: { courseId: string; lesson: Lesson | null; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<FormState<LessonFormValues>, FormData>(saveLesson.bind(null, courseId, lesson?.id ?? null), { status: "idle" });
  const [submitted, setSubmitted] = useState(false);
  const errors = state.fieldErrors ?? {};

  // Close once a submission comes back without errors.
  useEffect(() => {
    if (submitted && !pending && state.status === "idle") {
      toast.success(lesson ? "Lesson saved" : "Lesson added");
      onClose();
    }
  }, [submitted, pending, state, lesson, onClose]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(true);
    startTransition(() => formAction(data));
  }

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl bg-white shadow-2xl outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title className="text-lg font-bold text-slate-900">{lesson ? "Edit lesson" : "New lesson"}</Dialog.Title>
            <Dialog.Close aria-label="Close" className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <form noValidate onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="space-y-4 overflow-y-auto px-6 py-5">
              {state.message && (
                <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  <CircleAlert className="size-4" /> {state.message}
                </p>
              )}
              <Field label="Title" error={errors.title}>
                <input name="title" defaultValue={lesson?.title} autoFocus className={input(errors.title)} />
              </Field>
              <Field label="Short summary" error={errors.summary}>
                <input name="summary" defaultValue={lesson?.summary ?? ""} className={input(errors.summary)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <Field label="Video link" hint="YouTube, Vimeo or any link" error={errors.videoUrl}>
                  <input name="videoUrl" type="url" defaultValue={lesson?.videoUrl ?? ""} placeholder="https://youtu.be/…" className={input(errors.videoUrl)} />
                </Field>
                <Field label="Minutes" error={errors.durationMinutes}>
                  <input name="durationMinutes" type="number" min={1} defaultValue={lesson?.durationMinutes ?? ""} className={input(errors.durationMinutes)} />
                </Field>
              </div>
              <Field label="Lesson notes" hint="Shown under the video" error={errors.content}>
                <textarea name="content" rows={8} defaultValue={lesson?.content ?? ""} className={input(errors.content, "h-auto py-3 leading-relaxed")} />
              </Field>
              <label className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" name="freePreview" defaultChecked={lesson?.freePreview} className="size-4 accent-brand-orange" />
                <span className="text-sm text-slate-700">
                  <span className="font-semibold">Free preview</span>: anyone can watch it before enrolling
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <Dialog.Close className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</Dialog.Close>
              <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-70">
                {pending && <LoaderCircle className="size-4 animate-spin" />}
                {lesson ? "Save lesson" : "Add lesson"}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Learners ──────────────────────────────────────────────────────────────

type Learner = { enrollment: Enrollment; student: Profile; completed: number };

export function LearnersPanel({ courseId, learners, lessonCount }: { courseId: string; learners: Learner[]; lessonCount: number }) {
  const { pending, run } = useRun();
  const [email, setEmail] = useState("");

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="px-6 pb-3 pt-5">
        <h3 className="text-lg font-bold text-slate-900">Learners</h3>
        <p className="text-sm text-slate-500">Confirm payments for enrollment requests, or add a student directly.</p>
      </div>

      <form
        className="flex gap-2 px-6 pb-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            const r = await enrollByEmail(courseId, email);
            if (!r.error) setEmail("");
            return r;
          }, "Student enrolled");
        }}
      >
        <label htmlFor="enroll-email" className="sr-only">
          Student email
        </label>
        <input id="enroll-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@email.com" className={input(undefined, "min-w-0 flex-1")} />
        <button type="submit" disabled={pending || !email} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42] disabled:opacity-50">
          <UserPlus className="size-4" /> Enroll
        </button>
      </form>

      {learners.length ? (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {learners.map(({ enrollment: e, student, completed }) => {
            const name = [student.firstName, student.lastName].filter(Boolean).join(" ") || student.email;
            const s = ENROLLMENT_STATUS[e.status];
            return (
              <li key={e.id} className={cn("flex flex-wrap items-center gap-3 px-6 py-3", e.status === "pending_payment" && "bg-amber-50/40")}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                  <p className="truncate text-xs text-slate-500">{student.email}</p>
                </div>
                {(e.status === "active" || e.status === "completed") && (
                  <span className="text-xs text-slate-500">
                    {completed}/{lessonCount} lessons
                  </span>
                )}
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", s.tone)}>{s.label}</span>
                {e.status === "pending_payment" && (
                  <button type="button" disabled={pending} onClick={() => run(() => setEnrollmentStatus(e.id, "active"), "Payment confirmed: course unlocked")} className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                    Confirm payment
                  </button>
                )}
                {e.status !== "cancelled" && e.status !== "completed" && (
                  <button type="button" disabled={pending} onClick={() => run(() => setEnrollmentStatus(e.id, "cancelled"), "Enrollment cancelled")} className="h-8 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60">
                    Cancel
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="border-t border-slate-100 px-6 py-6 text-sm text-slate-500">No learners yet.</p>
      )}
    </section>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("flex size-8 items-center justify-center rounded-lg text-slate-400 transition disabled:opacity-30", danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-100 hover:text-slate-800")}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {hint && <span className="ml-2 font-normal text-slate-400">{hint}</span>}
      </span>
      <span className="block [&>*]:w-full">{children}</span>
      {error && (
        <span className="flex items-center gap-1.5 text-[0.8rem] font-medium text-red-600">
          <CircleAlert className="size-3.5" /> {error}
        </span>
      )}
    </label>
  );
}
