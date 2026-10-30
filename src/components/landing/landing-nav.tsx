"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LINKS = [
  { id: "journey", label: "How it works" },
  { id: "scholarships", label: "Scholarships" },
  { id: "local", label: "Why us" },
];

export function LandingNav() {
  const [active, setActive] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const marker = Math.max(nav.current?.closest("header")?.getBoundingClientRect().bottom ?? 72, nav.current?.getBoundingClientRect().bottom ?? 0) + 24;
      const section = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      const id = section?.id === "testimonials" ? "local" : section?.id;
      setActive(LINKS.some((link) => link.id === id) ? id! : null);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    const main = document.querySelector("main");
    if (main) observer.observe(main);
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <nav ref={nav} aria-label="Main" className="flex items-center justify-center gap-1 max-md:absolute max-md:inset-x-0 max-md:top-full max-md:border-b max-md:border-slate-200 max-md:bg-white/95 max-md:py-2 md:gap-2">
      {LINKS.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          aria-current={active === link.id ? "location" : undefined}
          className={cn(
            "rounded-full px-3 py-2 text-xs font-semibold transition-colors hover:bg-brand-orange/10 hover:text-brand-orange-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange sm:px-4 sm:text-sm",
            active === link.id ? "bg-brand-orange/10 text-brand-orange-dark ring-1 ring-brand-orange/25" : "text-slate-600",
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
