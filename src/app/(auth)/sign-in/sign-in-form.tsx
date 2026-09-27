"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { KeyRound, Lock, Mail } from "lucide-react";
import {
  AFTER_AUTH_URL,
  describeClerkError,
  SSO_CALLBACK_URL,
  type SocialStrategy,
} from "../_components/clerk-helpers";
import { FormAlert, OrDivider, PasswordField, SocialButtons, SubmitButton, TextField } from "../_components/form-controls";
import { SuccessModal } from "../_components/success-modal";
import { useRedirectIfSignedIn } from "../_components/use-redirect-if-signed-in";

type Errors = Partial<Record<"email" | "password" | "code", string>>;
type Step = "credentials" | "verify" | "done";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInForm({ welcome }: { welcome: boolean }) {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { user } = useUser();
  useRedirectIfSignedIn(welcome);

  // `welcome` is set when returning from Google / Microsoft / LinkedIn already signed in.
  const [step, setStep] = useState<Step>(welcome ? "done" : "credentials");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string>();
  const [pending, setPending] = useState(false);
  const [socialPending, setSocialPending] = useState<SocialStrategy | null>(null);

  function fail(error: unknown) {
    const { field, message } = describeClerkError(error);
    if (field === "email" || field === "password" || field === "code") setErrors({ [field]: message });
    else setAlert(message);
  }

  async function finish() {
    // A no-op navigate keeps the user here so the welcome modal can show.
    const { error } = await signIn.finalize({ navigate: () => {} });
    if (error) return fail(error);
    setStep("done");
  }

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailValue = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const next: Errors = {};
    if (!emailValue) next.email = "Enter your email address.";
    else if (!EMAIL_RE.test(emailValue)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setAlert(undefined);
    if (Object.keys(next).length) return;

    setEmail(emailValue);
    setPending(true);
    try {
      const { error } = await signIn.password({ identifier: emailValue, password });
      if (error) return fail(error);

      if (signIn.status === "complete") return await finish();
      // New device or 2FA: Clerk wants a code emailed to the user.
      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) return fail(sendError);
        return setStep("verify");
      }
      setAlert("This account needs an extra verification step we don't support yet.");
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
      const { error } = await signIn.mfa.verifyEmailCode({ code });
      if (error) return fail(error);
      if (signIn.status === "complete") await finish();
    } finally {
      setPending(false);
    }
  }

  async function handleSocial(strategy: SocialStrategy) {
    setAlert(undefined);
    setSocialPending(strategy);
    const { error } = await signIn.sso({
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

  const clear = (field: keyof Errors) => () => {
    setAlert(undefined);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (step === "verify") {
    return (
      <>
        <div className="mb-6 text-center short:mb-4">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
            Check your email
          </h1>
          <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
            We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span> to confirm
            it&apos;s you.
          </p>
        </div>

        <FormAlert message={alert} />

        <form method="post" noValidate onSubmit={handleVerify} className="space-y-4 short:space-y-3">
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
          <SubmitButton loading={pending}>Verify and sign in</SubmitButton>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setErrors({});
            setAlert(undefined);
          }}
          className="mt-6 w-full text-center text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 short:mt-4"
        >
          Use a different account
        </button>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
          Welcome back
        </h1>
        <p className="mt-1.5 text-[0.95rem] text-slate-500 short:text-sm">
          Sign in to continue your learning journey.
        </p>
      </div>

      <SocialButtons action="Sign in" onSelect={handleSocial} pending={socialPending} />
      <OrDivider />

      <FormAlert message={alert} />

      <form method="post" noValidate onSubmit={handleCredentials} className="space-y-4 short:space-y-3">
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

        <PasswordField
          label="Password"
          icon={Lock}
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
          onChange={clear("password")}
        />

        <div className="flex items-center justify-end">
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

      {step === "done" && user && (
        <SuccessModal
          title={`Welcome back${user.firstName ? `, ${user.firstName}` : ""}!`}
          message={
            <>
              You&apos;re signed in as{" "}
              <span className="font-semibold text-slate-700">{user.primaryEmailAddress?.emailAddress}</span>.
            </>
          }
          actionLabel="Continue"
          onAction={() => router.push("/")}
        />
      )}
    </>
  );
}
