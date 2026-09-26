"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check, Lock, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";

type Field = "firstName" | "lastName" | "email" | "password" | "terms";
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Number", test: (v: string) => /\d/.test(v) },
  { label: "Symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-brand-blue", text: "text-brand-blue" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

export function SignUpForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const strength = STRENGTH[passed];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const next: Errors = {};
    if (!firstName) next.firstName = "Required.";
    if (!lastName) next.lastName = "Required.";
    if (!email) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Create a password.";
    else if (passed < 3) next.password = "Choose a stronger password.";
    if (!data.get("terms")) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    // TODO: call the sign-up endpoint here.
    setTimeout(() => setLoading(false), 1200);
  }

  const clear = (field: Field) => () =>
    errors[field] && setErrors((prev) => ({ ...prev, [field]: undefined }));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[1.85rem] font-bold leading-tight tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-[0.95rem] text-slate-500">
          Start learning for free. No credit card required.
        </p>
      </div>

      <SocialButtons action="Sign up" />
      <OrDivider label="or sign up with email" />

      <form noValidate onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="First name"
            icon={User}
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            error={errors.firstName}
            onChange={clear("firstName")}
          />
          <TextField
            label="Last name"
            icon={User}
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            error={errors.lastName}
            onChange={clear("lastName")}
          />
        </div>

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

        <div className="space-y-3">
          <PasswordField
            label="Password"
            icon={Lock}
            name="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password")();
            }}
          />

          {password && (
            <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-3">
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {PASSWORD_RULES.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-colors duration-300",
                        i < passed ? strength.bar : "bg-slate-200",
                      )}
                    />
                  ))}
                </div>
                <span className={cn("w-16 text-right text-xs font-semibold", strength.text)}>
                  {strength.label}
                </span>
              </div>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-1.5 text-xs transition-colors",
                        ok ? "text-emerald-600" : "text-slate-400",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-3.5 items-center justify-center rounded-full transition-colors",
                          ok ? "bg-emerald-500 text-white" : "bg-slate-200",
                        )}
                      >
                        {ok && <Check className="size-2.5" strokeWidth={3.5} />}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm leading-snug text-slate-600">
            <input
              type="checkbox"
              name="terms"
              onChange={clear("terms")}
              aria-invalid={!!errors.terms}
              className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-blue"
            />
            <span>
              I agree to the{" "}
              <Link href="/" className="font-semibold text-slate-800 underline-offset-2 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/" className="font-semibold text-slate-800 underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="pl-6.5 text-[0.8rem] font-medium text-red-600 animate-in fade-in">{errors.terms}</p>
          )}
        </div>

        <SubmitButton loading={loading}>Create account</SubmitButton>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
