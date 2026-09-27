"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/** Shows "Saved" once after the form redirects here with ?saved=<title>, then cleans the URL. */
export function SavedToast({ title }: { title?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (!title || shown.current) return;
    shown.current = true;
    toast.success("Scholarship saved", { description: title });
    router.replace(pathname, { scroll: false });
  }, [title, pathname, router]);

  return null;
}
