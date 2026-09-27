"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type SuccessModalProps = {
  title: string;
  message: ReactNode;
  actionLabel: string;
  onAction: () => void;
};

export function SuccessModal({ title, message, actionLabel, onAction }: SuccessModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onAction();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onAction]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-title"
        aria-describedby="success-message"
        className="relative w-full max-w-sm rounded-3xl bg-white px-8 pb-8 pt-10 text-center shadow-[0_24px_60px_-12px_rgba(15,23,42,0.35)] animate-in fade-in zoom-in-90 duration-300"
      >
        <AnimatedTick />

        <h2 id="success-title" className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p id="success-message" className="mt-2 text-[0.95rem] leading-relaxed text-slate-500">
          {message}
        </p>

        <button
          ref={buttonRef}
          type="button"
          onClick={onAction}
          className="group mt-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-orange text-[0.95rem] font-semibold text-white shadow-[0_8px_20px_-6px_rgba(245,130,32,0.55)] transition hover:bg-brand-orange-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-orange/25"
        >
          {actionLabel}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/** Green circle that draws itself, then a check mark stroke. Keyframes live in globals.css. */
function AnimatedTick() {
  return (
    <div className="relative mx-auto size-20">
      <span aria-hidden className="absolute inset-0 rounded-full bg-emerald-500/15 opacity-0 animate-[tick-pulse_1.6s_ease-out_0.5s_1]" />
      <svg viewBox="0 0 52 52" className="relative size-20" aria-hidden>
        <circle
          cx="26"
          cy="26"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-emerald-500 [stroke-dasharray:151] [stroke-dashoffset:151] animate-[tick-draw_0.6s_ease-out_forwards]"
        />
        <circle cx="26" cy="26" r="21" className="fill-emerald-500 opacity-0 animate-[tick-fill_0.3s_ease-out_0.45s_forwards]" />
        <path
          d="M15 27l7.5 7.5L37.5 19"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[stroke-dasharray:36] [stroke-dashoffset:36] animate-[tick-draw_0.35s_ease-out_0.65s_forwards]"
        />
      </svg>
    </div>
  );
}
