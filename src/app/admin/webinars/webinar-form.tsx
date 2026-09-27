"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, LoaderCircle, Save } from "lucide-react";
import { Dropdown } from "@/components/forms/dropdown";
import type { Webinar } from "@/db/schema";
import type { FormState, WebinarFormValues } from "@/lib/validation/learning";
import { cn } from "@/lib/utils";
import { input } from "../courses/course-form";

type Action = (prev: FormState<WebinarFormValues>, formData: FormData) => Promise<FormState<WebinarFormValues>>;

/** Date → value for <input type="datetime-local"> in the admin's own timezone. */
function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function WebinarForm({ action, initial, courses }: { action: Action; initial?: Webinar; courses: { id: string; title: string }[] }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [access, setAccess] = useState(initial?.access ?? "everyone");
  const errors = state.fieldErrors ?? {};
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // The picker gives local wall-clock time; send an exact instant so every student sees their own local time.
    const local = String(data.get("startsLocal") ?? "");
    data.set("startsAt", local ? new Date(local).toISOString() : "");
    data.delete("startsLocal");
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6 pb-24">
      {state.message && (
        <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <CircleAlert className="size-4 shrink-0" /> {state.message}
        </div>
      )}

      <Section title="Session">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <input name="title" defaultValue={initial?.title} placeholder="e.g. How I won the GKS scholarship: Q&A" className={input(errors.title)} />
        </Field>
        <Field label="Host" error={errors.hostName}>
          <input name="hostName" defaultValue={initial?.hostName} placeholder="e.g. Min-ji Park, GKS 2024 scholar" className={input(errors.hostName)} />
        </Field>
        <Field label="Length (minutes)" error={errors.durationMinutes}>
          <input name="durationMinutes" type="number" min={15} max={480} defaultValue={initial?.durationMinutes ?? 60} className={input(errors.durationMinutes)} />
        </Field>
        <Field label="Starts" hint={`Your time (${timeZone})`} error={errors.startsAt}>
          <input name="startsLocal" type="datetime-local" defaultValue={initial ? toLocalInput(initial.startsAt) : ""} className={input(errors.startsAt)} />
        </Field>
        <div className="hidden sm:block" />
        <Field label="Description" error={errors.description} className="sm:col-span-2">
          <textarea name="description" rows={4} defaultValue={initial?.description ?? ""} className={input(errors.description, "h-auto py-3")} />
        </Field>
      </Section>

      <Section title="Links">
        <Field label="Zoom / Google Meet link" hint="Only revealed to registered students when the room opens" error={errors.joinUrl} className="sm:col-span-2">
          <input name="joinUrl" type="url" defaultValue={initial?.joinUrl} placeholder="https://zoom.us/j/…" className={input(errors.joinUrl)} />
        </Field>
        <Field label="Recording link" hint="Add after the session" error={errors.recordingUrl} className="sm:col-span-2">
          <input name="recordingUrl" type="url" defaultValue={initial?.recordingUrl ?? ""} placeholder="https://" className={input(errors.recordingUrl)} />
        </Field>
      </Section>

      <Section title="Who can attend">
        <fieldset className="sm:col-span-2">
          <legend className="sr-only">Access</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["everyone", "Everyone", "Any signed-in student can register"],
                ["enrolled", "Course students only", "Only learners enrolled in a course"],
              ] as const
            ).map(([value, label, hint]) => (
              <label key={value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5">
                <input type="radio" name="access" value={value} checked={access === value} onChange={() => setAccess(value)} className="mt-0.5 accent-brand-blue" />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {access === "enrolled" && (
          <Field label="Course" error={errors.courseId} className="sm:col-span-2">
            <Dropdown
              name="courseId"
              defaultValue={initial?.courseId ?? undefined}
              placeholder={courses.length ? "Choose a course" : "Create a course first"}
              invalid={Boolean(errors.courseId)}
              options={courses.map((c) => ({ value: c.id, label: c.title }))}
            />
          </Field>
        )}
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:left-[296px]">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-2">
          <Link href="/admin/webinars" className="h-11 rounded-xl px-4 text-sm font-semibold leading-[2.75rem] text-slate-600 transition hover:bg-slate-100">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark disabled:opacity-70">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {initial ? "Save changes" : "Schedule webinar"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, hint, error, className, children }: { label: string; hint?: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
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
