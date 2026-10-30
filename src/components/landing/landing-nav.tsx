"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "home", label: "Home", detail: "Your next chapter starts here" },
  { id: "journey", label: "How it works", detail: "One route, four stops" },
  { id: "scholarships", label: "Scholarships", detail: "Find your opportunity" },
  { id: "courses", label: "Courses", detail: "Build your skills and confidence" },
  { id: "local", label: "Why us", detail: "Support built around you" },
  { id: "testimonials", label: "Testimonials", detail: "Meet our community" },
  { id: "sessions", label: "Live sessions", detail: "Learn and ask questions, live" },
];

export function LandingHeader({ showCourses, showSessions }: { showCourses: boolean; showSessions: boolean }) {
  const links = SECTIONS.filter((link) => (link.id !== "courses" || showCourses) && (link.id !== "sessions" || showSessions));
  const [active, setActive] = useState<string | null>("home");
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const marker = (header.current?.getBoundingClientRect().bottom ?? 72) + 28;
      const section = Array.from(document.querySelectorAll<HTMLElement>("main section[id]")).find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      setActive(section?.id ?? null);
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

  useEffect(() => {
    if (!open) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1280px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open]);

  return (
    <header ref={header} className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="#home" aria-label="MoreSo Tech home" className="shrink-0"><Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} preload className="h-9 w-auto sm:h-10" /></Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {links.map((link) => <a key={link.id} href={`#${link.id}`} aria-current={active === link.id ? "location" : undefined} className={cn("relative rounded-full px-2.5 py-2.5 text-xs font-semibold transition-colors hover:bg-brand-orange/10 hover:text-brand-orange-dark focus-visible:outline-2 focus-visible:outline-brand-orange", active === link.id ? "bg-brand-orange/10 text-brand-orange-dark" : "text-slate-600")}>{link.label}</a>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:inline-flex">Sign in</Link>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-[#0f1b2d] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-blue sm:px-5 sm:text-sm">Get started<ArrowUpRight aria-hidden className="size-4" /></Link>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open} aria-controls="mobile-navigation" className="flex size-11 items-center justify-center rounded-full border border-slate-200 text-[#0f1b2d] transition hover:border-brand-orange hover:bg-brand-orange/10 focus-visible:outline-2 focus-visible:outline-brand-orange xl:hidden"><Menu className="size-5" /></button>
        </div>
      </div>
      <dialog ref={dialog} id="mobile-navigation" aria-labelledby="mobile-navigation-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="landing-menu m-0 ml-auto h-dvh max-h-dvh w-full max-w-md border-0 bg-[#f7f3ec] p-0 text-[#0f1b2d] shadow-2xl backdrop:bg-[#0f1b2d]/50 backdrop:backdrop-blur-sm">
        <div className="flex min-h-full flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8">
          <div className="flex items-center justify-between border-b border-[#0f1b2d]/10 pb-6">
            <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} className="h-10 w-auto" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex size-11 items-center justify-center rounded-full border border-[#0f1b2d]/15 transition hover:rotate-90 hover:bg-white focus-visible:outline-2 focus-visible:outline-brand-orange motion-reduce:transform-none"><X className="size-5" /></button>
          </div>
          <div className="pb-5 pt-8"><p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand-orange">From Harare to Seoul</p><h2 id="mobile-navigation-title" className="mt-2 font-heading text-3xl font-extrabold tracking-tight">Find your next step.</h2></div>
          <nav aria-label="Mobile main" className="flex-1">
            {links.map((link, index) => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)} aria-current={active === link.id ? "location" : undefined} className={cn("landing-menu-link group flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-brand-orange", active === link.id ? "bg-white shadow-[0_8px_24px_-16px_rgba(15,27,45,0.4)]" : "")} style={{ animationDelay: `${index * 35}ms` }}><span className={cn("text-xs font-bold tabular-nums", active === link.id ? "text-brand-orange" : "text-slate-400")}>0{index + 1}</span><span className="flex-1"><span className="block text-lg font-bold tracking-tight">{link.label}</span><span className="mt-0.5 block text-xs text-slate-500">{link.detail}</span></span><ArrowUpRight aria-hidden className={cn("size-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5", active === link.id ? "text-brand-orange" : "text-slate-400")} /></a>)}
          </nav>
          <div className="mt-7 border-t border-[#0f1b2d]/10 pt-6"><Link href="/sign-up" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-2xl bg-[#0f1b2d] px-5 py-4 text-sm font-bold text-white transition hover:bg-brand-blue">Start your journey<ArrowRight className="size-5" /></Link><p className="mt-4 text-center text-sm text-slate-500">Already part of the community? <Link href="/sign-in" onClick={() => setOpen(false)} className="font-bold text-brand-blue underline-offset-4 hover:underline">Sign in</Link></p></div>
        </div>
      </dialog>
    </header>
  );
}
