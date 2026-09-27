"use client";

import { useRouter } from "next/navigation";
import { HandleSSOCallback } from "@clerk/react";
import { LoaderCircle } from "lucide-react";
import { AFTER_AUTH_URL } from "../_components/clerk-helpers";

/** Google / Microsoft / LinkedIn return here; Clerk finishes the sign-in, then we show the welcome modal. */
export default function SSOCallbackPage() {
  const router = useRouter();

  return (
    <div className="flex h-dvh flex-1 flex-col items-center justify-center gap-3 bg-white text-slate-500">
      <LoaderCircle className="size-8 animate-spin text-brand-blue" />
      <p className="text-sm font-medium">Signing you in…</p>
      <HandleSSOCallback
        navigateToApp={({ decorateUrl }) => {
          const destination = decorateUrl(AFTER_AUTH_URL);
          if (destination.startsWith("http")) window.location.href = destination;
          else router.push(destination);
        }}
        navigateToSignIn={() => router.push("/sign-in")}
        navigateToSignUp={() => router.push("/sign-up")}
      />
    </div>
  );
}
