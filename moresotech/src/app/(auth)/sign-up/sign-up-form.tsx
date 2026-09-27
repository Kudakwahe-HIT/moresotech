"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { Lock, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUp, type AuthState } from "../actions";
import { FormAlert, OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";
import { SuccessModal } from "../_components/success-modal";

type Field = "firstName" | "lastName" | "email" | "password" | "terms";
type Errors = Partial<Record<Field, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  { hint: "more characters", test: (v: string) => v.length >= 8 },
  { hint: "an uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { hint: "a number", test: (v: string) => /\d/.test(v) },
  { hint: "a symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-brand-blue", text: "text-brand-blue" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
];

export function SignUpForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUp, { status: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [alertHidden, setAlertHidden] = useState(false);
  const [password, setPassword] = useState("");

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const strength = STRENGTH[passed];
  const missing = PASSWORD_RULES.find((rule) => !rule.test(password));

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

    setAlertHidden(false);
    // Dispatching manually (instead of <form action>) keeps the typed values after a failed attempt.
    startTransition(() => formAction(data));
  }

  // Server errors (e.g. email already taken) show until the user edits that field; an explicit
  // `undefined` in local state hides the server message for that field.
  const serverErrors = state.status === "error" && !pending ? (state.fieldErrors ?? {}) : {};
  const shown: Errors = { ...serverErrors, ...errors };
  const serverError = state.status === "error" && !pending && !alertHidden ? state.message : undefined;

  const clear = (field: Field) => () => {
    setAlertHidden(true);
    if (shown[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight short:text-2xl tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
          Start learning for free. No credit card required.
        </p>
      </div>

      <SocialButtons action="Sign up" />
      <OrDivider label="or sign up with email" />

      <FormAlert message={serverError} />

      <form noValidate onSubmit={handleSubmit} className="space-y-4 short:space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="First name"
            icon={User}
            name="firstName"
            autoComplete="given-name"
            placeholder="Jane"
            error={shown.firstName}
            onChange={clear("firstName")}
          />
          <TextField
            label="Last name"
            icon={User}
            name="lastName"
            autoComplete="family-name"
            placeholder="Doe"
            error={shown.lastName}
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
          error={shown.email}
          onChange={clear("email")}
        />

        <div className="space-y-2">
          <PasswordField
            label="Password"
            icon={Lock}
            name="password"
            autoComplete="new-password"
            placeholder="8+ characters, mixed case, number"
            value={password}
            error={shown.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password")();
            }}
          />

          {password && !shown.password && (
            <div className="flex items-center gap-3 animate-in fade-in" aria-live="polite">
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
              <span className="shrink-0 text-xs text-slate-500">
                <span className={cn("font-semibold", strength.text)}>{strength.label}</span>
                {missing && <> &middot; add {missing.hint}</>}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm leading-snug text-slate-600">
            <input
              type="checkbox"
              name="terms"
              onChange={clear("terms")}
              aria-invalid={!!shown.terms}
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
          {shown.terms && (
            <p className="pl-6.5 text-[0.8rem] font-medium text-red-600 animate-in fade-in">{shown.terms}</p>
          )}
        </div>

        <SubmitButton loading={pending}>Create account</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 short:mt-4">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
        >
          Sign in
        </Link>
      </p>

      {state.status === "success" && (
        <SuccessModal
          title={`Welcome, ${state.user.firstName}!`}
          message={
            <>
              Your account for <span className="font-semibold text-slate-700">{state.user.email}</span> is ready.
              Sign in to start learning.
            </>
          }
          actionLabel="Continue to sign in"
          onAction={() => router.push("/sign-in")}
        />
      )}
    </>
  );
}
