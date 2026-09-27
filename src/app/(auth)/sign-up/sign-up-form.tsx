"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { KeyRound, Lock, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AFTER_AUTH_URL,
  describeClerkError,
  SSO_CALLBACK_URL,
  type SocialStrategy,
} from "../_components/clerk-helpers";
import { FormAlert, OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";
import { SuccessModal } from "../_components/success-modal";
import { useRedirectIfSignedIn } from "../_components/use-redirect-if-signed-in";

type Field = "firstName" | "lastName" | "email" | "password" | "terms" | "code";
type Errors = Partial<Record<Field, string>>;
type Step = "details" | "verify" | "done";

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

const FIELDS: Field[] = ["firstName", "lastName", "email", "password", "code"];

export function SignUpForm() {
  const router = useRouter();
  const { signUp } = useSignUp();
  const { user } = useUser();
  useRedirectIfSignedIn();

  const [step, setStep] = useState<Step>("details");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string>();
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<SocialStrategy | null>(null);

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  const strength = STRENGTH[passed];
  const missing = PASSWORD_RULES.find((rule) => !rule.test(password));

  function fail(error: unknown) {
    const { field, message } = describeClerkError(error);
    if (field && FIELDS.includes(field as Field)) setErrors({ [field]: message });
    else setAlert(message);
  }

  async function finish() {
    // A no-op navigate keeps the user here so the welcome modal can show.
    const { error } = await signUp.finalize({ navigate: () => {} });
    if (error) return fail(error);
    setStep("done");
  }

  async function handleDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const emailValue = String(data.get("email") ?? "").trim();

    const next: Errors = {};
    if (!firstName) next.firstName = "Required.";
    if (!lastName) next.lastName = "Required.";
    if (!emailValue) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(emailValue)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Create a password.";
    else if (passed < 3) next.password = "Choose a stronger password.";
    if (!data.get("terms")) next.terms = "Please accept the terms to continue.";
    setErrors(next);
    setAlert(undefined);
    if (Object.keys(next).length) return;

    setEmail(emailValue);
    setPending(true);
    try {
      const { error } = await signUp.password({ emailAddress: emailValue, password, firstName, lastName });
      if (error) return fail(error);
      if (signUp.status === "complete") return await finish();

      // Clerk emails a 6-digit code to confirm the address.
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) return fail(sendError);
      setStep("verify");
    } finally {
      setPending(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    setAlert(undefined);
    if (!/^\d{6}$/.test(code)) return setErrors({ code: "Enter the 6-digit code." });

    setPending(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) return fail(error);
      if (signUp.status === "complete") await finish();
      else setAlert("Your account needs more information before it can be created.");
    } finally {
      setPending(false);
    }
  }

  async function resendCode() {
    setAlert(undefined);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) fail(error);
  }

  async function handleSocial(strategy: SocialStrategy) {
    setAlert(undefined);
    setSocialPending(strategy);
    const { error } = await signUp.sso({
      strategy,
      redirectUrl: AFTER_AUTH_URL,
      redirectCallbackUrl: SSO_CALLBACK_URL,
    });
    // On success the browser is already leaving for the provider.
    if (error) {
      setSocialPending(null);
      fail(error);
    }
  }

  const clear = (field: Field) => () => {
    setAlert(undefined);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (step === "verify") {
    return (
      <>
        <div className="mb-6 text-center short:mb-4">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
            Verify your email
          </h1>
          <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>.
          </p>
        </div>

        <FormAlert message={alert} />

        <form noValidate onSubmit={handleVerify} className="space-y-4 short:space-y-3">
          <TextField
            label="Verification code"
            icon={KeyRound}
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            autoFocus
            className="tracking-[0.4em]"
            error={errors.code}
            onChange={clear("code")}
          />
          <SubmitButton loading={pending}>Verify and create account</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 short:mt-4">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={resendCode}
            className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
          >
            Resend code
          </button>{" "}
          or{" "}
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setErrors({});
              setAlert(undefined);
            }}
            className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
          >
            change email
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
          Create your account
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
          Start learning for free. No credit card required.
        </p>
      </div>

      <SocialButtons action="Sign up" onSelect={handleSocial} pending={socialPending} />
      <OrDivider label="or sign up with email" />

      <FormAlert message={alert} />

      <form noValidate onSubmit={handleDetails} className="space-y-4 short:space-y-3">
        <div className="grid grid-cols-2 gap-3">
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
          defaultValue={email}
          error={errors.email}
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
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password")();
            }}
          />

          {password && !errors.password && (
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

        {/* Clerk renders its bot-protection challenge here when needed */}
        <div id="clerk-captcha" />

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

      {step === "done" && user && (
        <SuccessModal
          title={`Welcome${user.firstName ? `, ${user.firstName}` : ""}!`}
          message={
            <>
              Your account for{" "}
              <span className="font-semibold text-slate-700">{user.primaryEmailAddress?.emailAddress}</span> is
              ready and you&apos;re signed in.
            </>
          }
          actionLabel="Start learning"
          onAction={() => router.push("/")}
        />
      )}
    </>
  );
}
