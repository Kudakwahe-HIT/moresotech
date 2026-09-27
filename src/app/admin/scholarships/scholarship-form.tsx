"use client";

import Link from "next/link";
import {
  cloneElement,
  isValidElement,
  startTransition,
  useActionState,
  useState,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { CircleAlert, LoaderCircle, Save } from "lucide-react";
import { Dropdown, type DropdownOption } from "@/components/forms/dropdown";
import type { Scholarship } from "@/db/schema";
import { FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";
import type { ScholarshipFormState, ScholarshipFormValues } from "@/lib/validation/scholarship";
import { cn } from "@/lib/utils";

const FUNDING_HINTS: Record<string, string> = {
  full: "Tuition, living costs and usually flights",
  partial: "Covers part of the costs",
  tuition: "Tuition fees only",
  stipend: "Monthly allowance, no tuition",
};
const FUNDING_OPTIONS: DropdownOption[] = Object.entries(FUNDING_LABELS).map(([value, label]) => ({
  value,
  label,
  description: FUNDING_HINTS[value],
}));

type FormAction = (prev: ScholarshipFormState, formData: FormData) => Promise<ScholarshipFormState>;
type FieldName = keyof ScholarshipFormValues;

export function ScholarshipForm({ action, initial }: { action: FormAction; initial?: Scholarship }) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const errors = state.fieldErrors ?? {};

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // Dispatching manually (instead of <form action>) keeps what the admin typed if validation fails.
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-6 pb-24">
      {state.message && (
        <div role="alert" className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <CircleAlert className="size-4 shrink-0" />
          {state.message}
        </div>
      )}

      <Section title="Basics" description="What the scholarship is and who offers it.">
        <Field name="title" label="Title" error={errors.title} className="sm:col-span-2">
          <input name="title" defaultValue={initial?.title} placeholder="e.g. Global Korea Scholarship (GKS) — Graduate" className={input(errors.title)} />
        </Field>
        <Field name="provider" label="Provider" error={errors.provider}>
          <input name="provider" defaultValue={initial?.provider} placeholder="e.g. NIIED (Korean Government)" className={input(errors.provider)} />
        </Field>
        <Field name="university" label="University" hint="Leave empty if it's for any university" error={errors.university}>
          <input name="university" defaultValue={initial?.university ?? ""} placeholder="e.g. Yonsei University" className={input(errors.university)} />
        </Field>
        <Field name="country" label="Country" error={errors.country}>
          <input name="country" defaultValue={initial?.country ?? "South Korea"} className={input(errors.country)} />
        </Field>
        <Field name="intake" label="Intake" error={errors.intake}>
          <input name="intake" defaultValue={initial?.intake ?? ""} placeholder="e.g. Spring 2027" className={input(errors.intake)} />
        </Field>
      </Section>

      <Section title="Funding & level">
        <Field name="level" label="Study level" error={errors.level}>
          <Dropdown
            name="level"
            defaultValue={initial?.level}
            placeholder="Choose a level"
            invalid={Boolean(errors.level)}
            options={Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </Field>
        <Field name="fundingType" label="Funding type" error={errors.fundingType}>
          <Dropdown
            name="fundingType"
            defaultValue={initial?.fundingType}
            placeholder="Choose funding"
            invalid={Boolean(errors.fundingType)}
            options={FUNDING_OPTIONS}
          />
        </Field>
        <Field name="amount" label="What's covered" hint="Shown in the key facts" error={errors.amount} className="sm:col-span-2">
          <input name="amount" defaultValue={initial?.amount ?? ""} placeholder="e.g. Full tuition, airfare and a monthly living allowance" className={input(errors.amount)} />
        </Field>
      </Section>

      <Section title="Dates">
        <Field name="opensAt" label="Applications open" error={errors.opensAt}>
          <input type="date" name="opensAt" defaultValue={initial?.opensAt ?? ""} className={input(errors.opensAt)} />
        </Field>
        <Field name="deadline" label="Deadline" hint="Leave empty for a rolling deadline" error={errors.deadline}>
          <input type="date" name="deadline" defaultValue={initial?.deadline ?? ""} className={input(errors.deadline)} />
        </Field>
      </Section>

      <Section title="Description" description="Students see the summary on cards and the full description on the detail page.">
        <Field
          name="summary"
          label="Summary"
          error={errors.summary}
          className="sm:col-span-2"
          aside={<span className={cn("text-xs", summary.length > 300 ? "text-red-600" : "text-slate-400")}>{summary.length}/300</span>}
        >
          <textarea
            name="summary"
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="One or two sentences on why this scholarship matters."
            className={input(errors.summary, "h-auto py-3")}
          />
        </Field>
        <Field name="description" label="Full description" error={errors.description} className="sm:col-span-2">
          <textarea name="description" rows={6} defaultValue={initial?.description ?? ""} className={input(errors.description, "h-auto py-3")} />
        </Field>
      </Section>

      <Section title="Details" description="One item per line. These become checklists for students.">
        <ListField name="eligibility" label="Eligibility" initial={initial?.eligibility} placeholder={"Citizen of an eligible country\nUnder 25 years old on 1 March"} error={errors.eligibility} />
        <ListField name="benefits" label="Benefits" initial={initial?.benefits} placeholder={"Full tuition\nMonthly living allowance"} error={errors.benefits} />
        <ListField name="requiredDocuments" label="Required documents" initial={initial?.requiredDocuments} placeholder={"Passport copy\nApostilled high school transcript"} error={errors.requiredDocuments} />
        <ListField name="requiredCertificates" label="Required certificates" initial={initial?.requiredCertificates} placeholder={"TOPIK Level 3\nIELTS 5.5"} error={errors.requiredCertificates} />
      </Section>

      <Section title="Publishing">
        <Field name="applyUrl" label="Official website" error={errors.applyUrl} className="sm:col-span-2">
          <input name="applyUrl" type="url" defaultValue={initial?.applyUrl ?? ""} placeholder="https://" className={input(errors.applyUrl)} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-semibold text-slate-700">Status</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(
              [
                ["draft", "Draft", "Only admins can see it"],
                ["published", "Published", "Visible to all students"],
                ["closed", "Closed", "Visible, marked as closed"],
              ] as const
            ).map(([value, label, hint]) => (
              <label
                key={value}
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue/5"
              >
                <input type="radio" name="status" value={value} defaultChecked={(initial?.status ?? "draft") === value} className="mt-0.5 accent-brand-blue" />
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{label}</span>
                  <span className="block text-xs text-slate-500">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured} className="size-4 accent-brand-orange" />
          <span className="text-sm text-slate-700">
            <span className="font-semibold">Feature this scholarship</span> — shown first, with a highlight
          </span>
        </label>
      </Section>

      {/* Save bar pinned to the bottom of the viewport */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md lg:left-[296px]">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-2">
          <Link href="/admin/scholarships" className="h-11 rounded-xl px-4 text-sm font-semibold leading-[2.75rem] text-slate-600 transition hover:bg-slate-100">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-orange px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark disabled:opacity-70"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
            {initial ? "Save changes" : "Create scholarship"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  name,
  label,
  hint,
  error,
  aside,
  className,
  children,
}: {
  name: FieldName;
  label: string;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={name} className="text-sm font-semibold text-slate-700">
          {label}
          {hint && <span className="ml-2 font-normal text-slate-400">{hint}</span>}
        </label>
        {aside}
      </div>
      {/* Give the single control inside an id matching the label. */}
      <div className="[&>*]:w-full" id={`${name}-wrap`}>
        {withId(children, name)}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-[0.8rem] font-medium text-red-600">
          <CircleAlert className="size-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

function ListField({
  name,
  label,
  initial,
  placeholder,
  error,
}: {
  name: FieldName;
  label: string;
  initial?: string[];
  placeholder: string;
  error?: string;
}) {
  return (
    <Field name={name} label={label} error={error}>
      <textarea name={name} rows={5} defaultValue={initial?.join("\n") ?? ""} placeholder={placeholder} className={input(error, "h-auto py-3 leading-relaxed")} />
    </Field>
  );
}

function withId(children: ReactNode, id: string) {
  return isValidElement(children) ? cloneElement(children as ReactElement<{ id?: string }>, { id }) : children;
}

function input(error?: string, extra?: string) {
  return cn(
    "h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
    error ? "border-red-300 focus:border-red-400 focus:ring-red-500/10" : "border-slate-200 hover:border-slate-300 focus:border-brand-blue focus:ring-brand-blue/10",
    extra,
  );
}
