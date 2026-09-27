"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LoaderCircle, Printer, RotateCcw, Smartphone, X } from "lucide-react";
import type { PaymentStatus } from "@/db/schema";
import { refreshPayment } from "../../checkout/actions";

type Props = {
  paymentId: string;
  initialStatus: PaymentStatus;
  initialDescription: string | null;
  flow: "seamless" | "redirect";
  methodName: string;
  instructions: string | null;
  maskedPhone: string | null;
  amountLabel: string;
  courseTitle: string;
  courseHref: string;
  checkoutHref: string;
  createdAt: string;
};

const POLL_MS = 4000;
const SLOW_AFTER_MS = 3 * 60_000;

/** Live status of one payment: waiting → paid (receipt) or failed (reason + retry). */
export function PaymentStatusView(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.initialStatus);
  const [description, setDescription] = useState(props.initialDescription);
  const [checking, setChecking] = useState(false);
  const [slow, setSlow] = useState(false);
  const busy = useRef(false);

  // Poll Pesepay (via the server) until the payment settles.
  useEffect(() => {
    if (status !== "pending") return;
    const started = new Date(props.createdAt).getTime();
    const tick = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const snap = await refreshPayment(props.paymentId);
        if (snap) {
          setStatus(snap.status);
          setDescription(snap.description);
          if (snap.status === "paid") router.refresh(); // pull in the receipt details
        }
      } finally {
        busy.current = false;
      }
      setSlow(Date.now() - started > SLOW_AFTER_MS);
    };
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [status, props.paymentId, props.createdAt, router]);

  async function checkNow() {
    setChecking(true);
    const snap = await refreshPayment(props.paymentId);
    if (snap) {
      setStatus(snap.status);
      setDescription(snap.description);
    }
    setChecking(false);
  }

  if (status === "paid") {
    return (
      <div className="text-center">
        <SuccessTick />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Payment successful</h1>
        <p className="mt-2 text-slate-500">
          You paid <span className="font-semibold text-slate-800">{props.amountLabel}</span> for {props.courseTitle}. Your course is unlocked.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 print:hidden">
          <Link href={props.courseHref} className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(245,130,32,0.7)] transition hover:bg-brand-orange-dark">
            Start learning <ArrowRight className="size-4" />
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <Printer className="size-4" /> Print receipt
          </button>
        </div>
      </div>
    );
  }

  if (status === "failed" || status === "cancelled") {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-50 text-red-500 ring-8 ring-red-50/60">
          <X className="size-9" strokeWidth={2.5} />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">{status === "cancelled" ? "Payment cancelled" : "Payment didn't go through"}</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">{description ?? "The payment wasn't completed."} If money left your account, contact us with the receipt number below.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href={props.checkoutHref} className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-orange px-6 text-sm font-bold text-white transition hover:bg-brand-orange-dark">
            <RotateCcw className="size-4" /> Try again
          </Link>
          <Link href={props.courseHref} className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  // Pending
  return (
    <div className="text-center" aria-live="polite">
      {props.flow === "seamless" ? (
        <div className="relative mx-auto flex size-28 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-orange/15 [animation-duration:2s]" />
          <span className="absolute inset-3 rounded-full bg-brand-orange/10" />
          <span className="relative flex size-16 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-[0_12px_28px_-10px_rgba(245,130,32,0.8)]">
            <Smartphone className="size-8" />
          </span>
        </div>
      ) : (
        <LoaderCircle className="mx-auto size-14 animate-spin text-brand-blue" />
      )}
      <h1 className="mt-6 text-2xl font-bold text-slate-900">{props.flow === "seamless" ? "Approve the payment on your phone" : "Confirming your payment…"}</h1>
      <p className="mx-auto mt-2 max-w-md text-slate-500">
        {props.flow === "seamless"
          ? props.instructions ??
            `We've sent a ${props.methodName} prompt${props.maskedPhone ? ` to ${props.maskedPhone}` : ""}. Enter your PIN to pay ${props.amountLabel}.`
          : "We're checking with Pesepay. This usually takes a few seconds."}
      </p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <LoaderCircle className="size-3.5 animate-spin" /> Waiting for confirmation — keep this page open
      </p>
      {slow && (
        <div className="mx-auto mt-6 max-w-md rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          Taking longer than usual? Make sure you approved the prompt, then check again. If nothing arrived, try again with another method.
          <div className="mt-3 flex justify-center gap-2">
            <button type="button" onClick={checkNow} disabled={checking} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">
              {checking ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Check again
            </button>
            <Link href={props.checkoutHref} className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-amber-800 hover:bg-amber-100">
              Try another method
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function SuccessTick() {
  return (
    <div className="relative mx-auto size-20">
      <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-500/15 opacity-0 animate-[tick-pulse_1.6s_ease-out_0.5s_1]" />
      <span className="relative flex size-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_12px_28px_-10px_rgba(16,185,129,0.8)] animate-in zoom-in-50 duration-300">
        <Check className="size-10" strokeWidth={3} />
      </span>
    </div>
  );
}
