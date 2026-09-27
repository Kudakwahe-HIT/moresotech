"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { ArrowLeft, KeyRound, Lock, Mail } from "lucide-react";
import { describeClerkError } from "../_components/clerk-helpers";
import { FormAlert, PasswordField, SubmitButton, TextField } from "../_components/form-controls";
import { SuccessModal } from "../_components/success-modal";
import { useRedirectIfSignedIn } from "../_components/use-redirect-if-signed-in";

type Field = "email" | "code" | "password";
type Errors = Partial<Record<Field, string>>;
type Step = "email" | "reset" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { user } = useUser();
  useRedirectIfSignedIn();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string>();
  const [pending, setPending] = useState(false);

  function fail(error: unknown) {
    const { field, message } = describeClerkError(error);
    if (field === "email" || field === "code" || field === "password") setErrors({ [field]: message });
    else setAlert(message);
  }

  async function sendCode(emailValue: string) {
    const { error } = await signIn.create({ identifier: emailValue });
    if (error) return fail(error);
    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) return fail(sendError);
    setStep("reset");
  }

  async function handleEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailValue = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setAlert(undefined);
    if (!emailValue) return setErrors({ email: "Enter your email address." });
    if (!EMAIL_RE.test(emailValue)) return setErrors({ email: "Enter a valid email address." });

    setEmail(emailValue);
    setPending(true);
    try {
      await sendCode(emailValue);
    } finally {
      setPending(false);
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "").trim();
    const password = String(data.get("password") ?? "");
    setAlert(undefined);

    const next: Errors = {};
    if (!/^\d{6}$/.test(code)) next.code = "Enter the 6-digit code.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setPending(true);
    try {
      // Only verify the code once; if the password is rejected the user can fix it and resubmit.
      if (signIn.status !== "needs_new_password") {
        const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code });
        if (error) return fail(error);
      }
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (error) return fail(error);

      if (signIn.status !== "complete") {
        return setAlert("Your password was changed. Please sign in to continue.");
      }
      const { error: finalizeError } = await signIn.finalize({ navigate: () => {} });
      if (finalizeError) return fail(finalizeError);
      setStep("done");
    } finally {
      setPending(false);
    }
  }

  const clear = (field: Field) => () => {
    setAlert(undefined);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (step === "email") {
    return (
      <>
        <div className="mb-6 text-center short:mb-4">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
            Forgot your password?
          </h1>
          <p className="mt-1.5 text-[0.95rem] leading-relaxed text-slate-500 short:text-sm">
            No worries. Enter the email linked to your account and we&apos;ll send you a reset code.
          </p>
        </div>

        <FormAlert message={alert} />

        <form noValidate onSubmit={handleEmail} className="space-y-4 short:space-y-3">
          <TextField
            label="Email address"
            icon={Mail}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            defaultValue={email}
            autoFocus
            error={errors.email}
            onChange={clear("email")}
          />
          <SubmitButton loading={pending}>Send reset code</SubmitButton>
        </form>

        <BackToSignIn />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
          Set a new password
        </h1>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-slate-500 short:text-sm">
          Enter the 6-digit code we sent to <span className="font-semibold text-slate-700">{email}</span> and
          choose a new password.
        </p>
      </div>

      <FormAlert message={alert} />

      <form noValidate onSubmit={handleReset} className="space-y-4 short:space-y-3">
        <TextField
          label="Reset code"
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
        <PasswordField
          label="New password"
          icon={Lock}
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password}
          onChange={clear("password")}
        />
        <SubmitButton loading={pending}>Reset password</SubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Didn&apos;t get it? Check your spam folder or{" "}
        <button
          type="button"
          disabled={pending}
          onClick={async () => {
            setAlert(undefined);
            const { error } = await signIn.resetPasswordEmailCode.sendCode();
            if (error) fail(error);
          }}
          className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark disabled:opacity-60"
        >
          resend
        </button>
        .
      </p>

      <BackToSignIn />

      {step === "done" && user && (
        <SuccessModal
          title={`Password updated${user.firstName ? `, ${user.firstName}` : ""}!`}
          message={
            <>
              You&apos;re signed in as{" "}
              <span className="font-semibold text-slate-700">{user.primaryEmailAddress?.emailAddress}</span>.
            </>
          }
          actionLabel="Continue"
          onAction={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}

function BackToSignIn() {
  return (
    <Link
      href="/sign-in"
      className="group mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 short:mt-4"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      Back to sign in
    </Link>
  );
}
