"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { signIn, type AuthState } from "../actions";
import { FormAlert, OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";
import { SuccessModal } from "../_components/success-modal";

type Errors = Partial<Record<"email" | "password", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signIn, { status: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [alertHidden, setAlertHidden] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (!email) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setAlertHidden(false);
    // Dispatching manually (instead of <form action>) keeps the typed values after a failed attempt.
    startTransition(() => formAction(data));
  }

  const clear = (field: keyof Errors) => () => {
    setAlertHidden(true);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const serverError = state.status === "error" && !pending && !alertHidden ? state.message : undefined;

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight short:text-2xl tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
          Sign in to continue your learning journey.
        </p>
      </div>

      <SocialButtons action="Sign in" />
      <OrDivider />

      <FormAlert message={serverError} />

      <form noValidate onSubmit={handleSubmit} className="space-y-4 short:space-y-3">
        <TextField
          label="Email address"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          onChange={clear("email")}
        />

        <PasswordField
          label="Password"
          icon={Lock}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
          onChange={clear("password")}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              name="remember"
              className="size-4 cursor-pointer rounded border-slate-300 accent-brand-blue"
            />
            Keep me signed in
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton loading={pending}>Sign in</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 short:mt-4">
        New to MoreSo Tech?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
        >
          Create a free account
        </Link>
      </p>

      {state.status === "success" && (
        <SuccessModal
          title={`Welcome back, ${state.user.firstName}!`}
          message={
            <>
              You&apos;re signed in as <span className="font-semibold text-slate-700">{state.user.email}</span>.
            </>
          }
          actionLabel="Continue"
          onAction={() => router.push("/")}
        />
      )}
    </>
  );
}
