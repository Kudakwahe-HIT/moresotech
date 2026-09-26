"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import { OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";

type Errors = Partial<Record<"email" | "password", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    // TODO: call the sign-in endpoint here.
    setTimeout(() => setLoading(false), 1200);
  }

  const clear = (field: keyof Errors) => () =>
    errors[field] && setErrors((prev) => ({ ...prev, [field]: undefined }));

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

        <SubmitButton loading={loading}>Sign in</SubmitButton>
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
    </>
  );
}
