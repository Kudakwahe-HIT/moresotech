"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { BadgeCheck } from "lucide-react";

/** Lets employers and universities check a certificate code without signing in. */
export function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) router.push(`/verify/${encodeURIComponent(clean)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md gap-2">
      <label className="sr-only" htmlFor="verify-code">
        Certificate code
      </label>
      <input
        id="verify-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. MST-7K2P9Q"
        autoComplete="off"
        className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm uppercase tracking-wide text-slate-900 outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
      />
      <button type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42]">
        <BadgeCheck className="size-4" /> Verify
      </button>
    </form>
  );
}
