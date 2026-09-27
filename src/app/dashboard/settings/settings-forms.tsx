"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { CircleAlert, Lock, LoaderCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dropdown } from "@/components/forms/dropdown";
import { Switch } from "@/components/forms/switch";
import type { UserSettings } from "@/db/schema";
import { LEVEL_LABELS } from "@/lib/scholarship-labels";
import { KOREAN_LEVELS, MUTABLE_NOTIFICATION_GROUPS, NOTIFICATION_GROUP_KEYS, type NotificationGroup } from "@/lib/settings-rules";
import type { FormState } from "@/lib/validation/learning";
import { NOT_SET, type StudyGoalsValues } from "@/lib/validation/settings";
import { cn } from "@/lib/utils";
import { input } from "@/app/admin/courses/course-form";
import { deleteMyAccount, saveNotificationPrefs, saveStudyGoals } from "./actions";

// ─── Study goals ───────────────────────────────────────────────────────────

export function StudyGoalsForm({ settings }: { settings: UserSettings | null }) {
  const [state, formAction, pending] = useActionState<FormState<StudyGoalsValues>, FormData>(saveStudyGoals, { status: "idle" });
  const errors = state.fieldErrors ?? {};
  const lastState = useRef(state);

  useEffect(() => {
    if (state !== lastState.current && state.message === "saved") toast.success("Study goals saved", { description: "Our reviewers will see them on your applications." });
    lastState.current = state;
  }, [state]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // Manual dispatch keeps typed values if validation fails.
    startTransition(() => formAction(data));
  }

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <CircleAlert className="size-4" /> {state.message}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="I want to study" error={errors.targetLevel}>
          <Dropdown
            name="targetLevel"
            defaultValue={settings?.targetLevel ?? NOT_SET}
            options={[{ value: NOT_SET, label: "Not decided yet" }, ...Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }))]}
          />
        </Field>
        <Field label="When I'd like to start" hint="e.g. Spring 2027" error={errors.targetIntake}>
          <input name="targetIntake" defaultValue={settings?.targetIntake ?? ""} placeholder="e.g. Spring 2027" className={input(errors.targetIntake)} />
        </Field>
        <Field label="Field of study" error={errors.fieldOfStudy}>
          <input name="fieldOfStudy" defaultValue={settings?.fieldOfStudy ?? ""} placeholder="e.g. Computer Science" className={input(errors.fieldOfStudy)} />
        </Field>
        <Field label="My Korean level" error={errors.koreanLevel}>
          <Dropdown
            name="koreanLevel"
            defaultValue={settings?.koreanLevel ?? NOT_SET}
            options={[{ value: NOT_SET, label: "Prefer not to say" }, ...Object.entries(KOREAN_LEVELS).map(([value, label]) => ({ value, label }))]}
          />
        </Field>
        <Field label="Country I live in" error={errors.country}>
          <input name="country" defaultValue={settings?.country ?? ""} placeholder="e.g. Zimbabwe" autoComplete="country-name" className={input(errors.country)} />
        </Field>
        <Field label="WhatsApp number" hint="So our team can reach you" error={errors.phone}>
          <input name="phone" type="tel" defaultValue={settings?.phone ?? ""} placeholder="+263 77 123 4567" autoComplete="tel" className={input(errors.phone)} />
        </Field>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark disabled:opacity-70">
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Save goals
        </button>
      </div>
    </form>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────

export function NotificationPreferences({ muted: initial }: { muted: string[] }) {
  const [muted, setMuted] = useState(initial);
  const [pending, start] = useTransition();
  const baseId = useId();

  function toggle(group: NotificationGroup, on: boolean) {
    const previous = muted;
    const next = on ? muted.filter((g) => g !== group) : [...muted, group];
    setMuted(next);
    start(async () => {
      const result = await saveNotificationPrefs(next);
      if (result.error) {
        setMuted(previous);
        toast.error(result.error);
      } else {
        toast.success(on ? "Notifications on" : "Notifications off", { description: MUTABLE_NOTIFICATION_GROUPS[group].label });
      }
    });
  }

  return (
    <ul className="divide-y divide-slate-100">
      <Row
        title="Things you need to do"
        description="Changes requested, documents to re-upload, applications ready to submit, and verifying your email."
        control={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            <Lock className="size-3" /> Always on
          </span>
        }
      />
      {NOTIFICATION_GROUP_KEYS.map((group) => {
        const g = MUTABLE_NOTIFICATION_GROUPS[group];
        return (
          <Row
            key={group}
            titleId={`${baseId}-${group}`}
            descriptionId={`${baseId}-${group}-d`}
            title={g.label}
            description={g.description}
            control={
              <Switch
                checked={!muted.includes(group)}
                disabled={pending}
                onCheckedChange={(on) => toggle(group, on)}
                aria-labelledby={`${baseId}-${group}`}
                aria-describedby={`${baseId}-${group}-d`}
              />
            }
          />
        );
      })}
      <Row
        title="Email notifications"
        description="Get these updates by email as well as on your dashboard."
        control={<span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">Coming soon</span>}
      />
    </ul>
  );
}

function Row({ title, description, control, titleId, descriptionId }: { title: string; description: string; control: ReactNode; titleId?: string; descriptionId?: string }) {
  return (
    <li className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p id={titleId} className="text-sm font-semibold text-slate-900">
          {title}
        </p>
        <p id={descriptionId} className="mt-0.5 text-sm text-slate-500">
          {description}
        </p>
      </div>
      <div className="shrink-0">{control}</div>
    </li>
  );
}

// ─── Delete account ────────────────────────────────────────────────────────

export function DeleteAccount({ hasPayments, supportEmail }: { hasPayments: boolean; supportEmail: string | null }) {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const confirmId = useId();

  if (hasPayments) {
    return (
      <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-600">
        Your account has payment records, which we&apos;re required to keep, so it can&apos;t be deleted from here.{" "}
        {supportEmail ? (
          <>
            Email{" "}
            <a href={`mailto:${supportEmail}?subject=Close%20my%20account`} className="font-semibold text-brand-blue hover:underline">
              {supportEmail}
            </a>{" "}
            and we&apos;ll close it for you.
          </>
        ) : (
          "Contact our team and we'll close it for you."
        )}
      </p>
    );
  }

  function onDelete() {
    setError(undefined);
    start(async () => {
      const result = await deleteMyAccount(confirmation);
      if (result.error) return setError(result.error);
      toast.success("Your account has been deleted");
      await signOut({ redirectUrl: "/" });
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="size-4" /> Delete my account
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-red-200 bg-red-50/60 p-4">
      <div className="text-sm text-red-800">
        <p className="font-semibold">This can&apos;t be undone. We&apos;ll permanently delete:</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>your applications and every document you uploaded</li>
          <li>your course progress and certificates (their verification codes will stop working)</li>
          <li>your saved scholarships, session registrations and settings</li>
        </ul>
        <p className="mt-2">Download your data first if you want a copy.</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={confirmId} className="text-sm font-semibold text-slate-800">
          Type <span className="font-mono">DELETE</span> to confirm
        </label>
        <input
          id={confirmId}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          autoComplete="off"
          className={cn(input(error), "w-full max-w-xs bg-white")}
        />
      </div>
      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending || confirmation.trim().toUpperCase() !== "DELETE"}
          onClick={onDelete}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />} Permanently delete my account
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setConfirmation("");
            setError(undefined);
          }}
          className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-white"
        >
          Keep my account
        </button>
      </div>
    </div>
  );
}

// ─── Shared ────────────────────────────────────────────────────────────────

export function Field({ label, hint, error, className, children }: { label: string; hint?: string; error?: string; className?: string; children: ReactNode }) {
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
