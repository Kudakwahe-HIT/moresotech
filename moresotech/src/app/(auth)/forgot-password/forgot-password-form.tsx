"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { SubmitButton, TextField } from "../_components/form-controls";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  function sendLink(email: string) {
    setLoading(true);
    // TODO: call the password-reset endpoint here.
    setTimeout(() => {
      setLoading(false);
      setSentTo(email);
    }, 1200);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return setError("Enter your email address.");
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    setError(undefined);
    sendLink(email);
  }

  if (sentTo) {
    return (
      <div className="text-center animate-in fade-in zoom-in-95 duration-300">
        <IconBadge>
          <MailCheck className="size-6" />
        </IconBadge>
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
          Check your email
        </h1>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-slate-500 short:text-sm">
          We sent a password reset link to{" "}
          <span className="font-semibold text-slate-800">{sentTo}</span>. It may take a minute to arrive.
        </p>

        <a
          href="mailto:"
          className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-brand-orange text-[0.95rem] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/25 short:h-10"
        >
          Open email app
        </a>

        <p className="mt-5 text-center text-sm text-slate-500">
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => sendLink(sentTo)}
            className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark disabled:opacity-60"
          >
            {loading ? "sending…" : "resend"}
          </button>
          .
        </p>

        <BackToSignIn />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 text-center short:mb-4">
        <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 short:text-2xl">
          Forgot your password?
        </h1>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-slate-500 short:text-sm">
          No worries. Enter the email linked to your account and we&apos;ll send you a reset link.
        </p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4 short:space-y-3">
        <TextField
          label="Email address"
          icon={Mail}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          error={error}
          onChange={() => error && setError(undefined)}
        />
        <SubmitButton loading={loading}>Send reset link</SubmitButton>
      </form>

      <BackToSignIn />
    </>
  );
}

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04] short:mb-4">
      {children}
    </div>
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
