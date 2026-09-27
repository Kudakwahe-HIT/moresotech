"use client";

import Link from "next/link";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import { CircleAlert, LoaderCircle, Save } from "lucide-react";
import { Dropdown } from "@/components/forms/dropdown";
import type { Course } from "@/db/schema";
import { COURSE_CATEGORIES } from "@/lib/learning-rules";
import type { CourseFormValues, FormState } from "@/lib/validation/learning";
import { cn } from "@/lib/utils";

type Instructor = { id: string; firstName: string | null; lastName: string | null; email: string };
type Action = (prev: FormState<CourseFormValues>, formData: FormData) => Promise<FormState<CourseFormValues>>;

const NO_INSTRUCTOR = "none";

export function CourseForm({ action, initial, instructors }: { action: Action; initial?: Course; instructors: Instructor[] }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const errors = state.fieldErrors ?? {};

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("instructorId") === NO_INSTRUCTOR) data.set("instructorId", "");
    // Manual dispatch keeps typed values if validation fails.
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6 pb-24">
      {state.message && (
        <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <CircleAlert className="size-4 shrink-0" /> {state.message}
        </div>
      )}

      <Section title="Course">
        <Field label="Title" error={errors.title} className="sm:col-span-2">
          <input name="title" defaultValue={initial?.title} placeholder="e.g. TOPIK Level 3 Preparation" className={input(errors.title)} />
        </Field>
        <Field label="One-line description" error={errors.subtitle} className="sm:col-span-2">
          <input name="subtitle" defaultValue={initial?.subtitle} placeholder="e.g. Reach TOPIK 3 in 12 weeks with guided practice tests." className={input(errors.subtitle)} />
        </Field>
        <Field label="Category" error={errors.category}>
          <Dropdown
            name="category"
            defaultValue={initial?.category}
            placeholder="Choose a category"
            invalid={Boolean(errors.category)}
            options={Object.entries(COURSE_CATEGORIES).map(([value, label]) => ({ value, label }))}
          />
        </Field>
        <Field label="Instructor" error={errors.instructorId}>
          <Dropdown
            name="instructorId"
            defaultValue={initial?.instructorId ?? NO_INSTRUCTOR}
            options={[
              { value: NO_INSTRUCTOR, label: "No instructor yet" },
              ...instructors.map((i) => ({ value: i.id, label: [i.firstName, i.lastName].filter(Boolean).join(" ") || i.email, description: i.email })),
            ]}
          />
        </Field>
        <Field label="Description" error={errors.description} className="sm:col-span-2">
          <textarea name="description" rows={5} defaultValue={initial?.description ?? ""} className={input(errors.description, "h-auto py-3")} />
        </Field>
        <Field label="What students will learn" hint="One per line" error={errors.outcomes} className="sm:col-span-2">
          <textarea
            name="outcomes"
            rows={4}
            defaultValue={initial?.outcomes.join("\n") ?? ""}
            placeholder={"Read and understand TOPIK II passages\nWrite a 300-word essay in Korean"}
            className={input(errors.outcomes, "h-auto py-3")}
          />
        </Field>
      </Section>

      <Section title="Price & certificate">
        <Field label="Price (USD)" hint="0 = free" error={errors.price}>
          <input name="price" type="number" min={0} step="0.01" inputMode="decimal" defaultValue={initial ? (initial.priceCents / 100).toString() : "0"} className={input(errors.price)} />
        </Field>
        <Field label="Certificate name" hint="Printed on the certificate" error={errors.certificateName}>
          <input name="certificateName" defaultValue={initial?.certificateName ?? ""} placeholder="e.g. TOPIK Level 3 Preparation Certificate" className={input(errors.certificateName)} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="awardsCertificate" defaultChecked={initial?.awardsCertificate ?? true} className="size-4 accent-brand-orange" />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Award a certificate</span> when a student completes every lesson
          </span>
        </label>
      </Section>

      <Section title="Visibility">
        <fieldset className="sm:col-span-2">
          <legend className="sr-only">Status</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                ["draft", "Draft", "Only staff can see it"],
                ["published", "Published", "Students can enroll"],
                ["archived", "Archived", "Hidden; learners keep access"],
              ] as const
            ).map(([value, label, hint]) => (
              <label key={value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5">
                <input type="radio" name="status" value={value} defaultChecked={(initial?.status ?? "draft") === value} className="mt-0.5 accent-brand-blue" />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:left-[296px]">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-2">
          <Link href={initial ? `/admin/courses/${initial.id}` : "/admin/courses"} className="h-11 rounded-xl px-4 text-sm font-semibold leading-[2.75rem] text-slate-600 transition hover:bg-slate-100">
            Cancel
          </Link>
          <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark disabled:opacity-70">
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {initial ? "Save changes" : "Create course"}
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

export function input(error?: string, extra?: string) {
  return cn(
    "h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
    error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-slate-200 hover:border-slate-300 focus:border-brand-blue focus:ring-brand-blue/10",
    extra,
  );
}
