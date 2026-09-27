"use client";

import { useState } from "react";
import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { LoaderCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function SignOutButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const [pending, setPending] = useState(false);

  return (
    <ClerkSignOutButton redirectUrl="/sign-in">
      <button
        type="button"
        onClick={() => setPending(true)}
        disabled={pending}
        className={cn(
          "inline-flex items-center justify-center gap-2 text-sm font-semibold transition focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70",
          variant === "sidebar"
            ? "mt-3 h-10 w-full rounded-xl bg-white/[0.06] text-slate-300 hover:bg-red-500/15 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400/40"
            : "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-4 focus-visible:ring-red-500/10",
        )}
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        Sign out
      </button>
    </ClerkSignOutButton>
  );
}
