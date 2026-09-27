"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

/**
 * Sends users who open an auth page while already signed in to their own area.
 * Only checks once, when Clerk first loads, so signing in on the page itself still shows the welcome modal.
 */
export function useRedirectIfSignedIn(skip = false) {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const checked = useRef(false);

  useEffect(() => {
    if (!isLoaded || checked.current) return;
    checked.current = true;
    // "/" sends each role to its own area.
    if (isSignedIn && !skip) router.replace("/");
  }, [isLoaded, isSignedIn, skip, router]);
}
