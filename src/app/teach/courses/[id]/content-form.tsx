"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { CircleAlert, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { CoverImageInput } from "@/components/forms/cover-image-input";
import { ListInput } from "@/components/forms/list-input";
import type { Course } from "@/db/schema";
import { coverUrl } from "@/lib/course-cover";
import type { CourseContentValues, FormState } from "@/lib/validation/learning";
import { updateCourseContent } from "@/app/admin/courses/actions";
import { input } from "@/app/admin/courses/course-form";

/** What an instructor can change: cover picture, subtitle, description, outcomes. */
export function CourseContentForm({ course }: { course: Course }) {
  const [state, formAction, pending] = useActionState<FormState<CourseContentValues>, FormData>(updateCourseContent.bind(null, course.id), { status: "idle" });
  const errors = state.fieldErrors ?? {};
  const lastState = useRef(state);

  useEffect(() => {
    if (state !== lastState.current && state.message === "saved") toast.success("Course content saved");
    lastState.current = state;
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Course content</h3>
        <p className="text-sm text-slate-500">Price, publishing and enrollment are managed by admins.</p>
      </div>
      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <CircleAlert className="size-4" /> {state.message}
        </p>
      )}
      <CoverImageInput name="coverImage" defaultPath={course.coverImage} defaultUrl={coverUrl(course)} error={errors.coverImage} />
      <Field label="One-line description" error={errors.subtitle}>
        <input name="subtitle" defaultValue={course.subtitle} className={input(errors.subtitle)} />
      </Field>
      <ListInput
        name="outcomes"
        label="What students will learn"
        variant="check"
        defaultValue={course.outcomes}
        placeholder="Add a learning outcome"
        error={errors.outcomes}
      />
      <Field label="Description" error={errors.description}>
        <textarea name="description" rows={6} defaultValue={course.description ?? ""} className={input(errors.description, "h-auto py-3")} />
      </Field>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-70">
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Save content
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
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
