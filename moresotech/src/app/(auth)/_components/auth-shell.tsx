import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  /** Link shown in the top-right corner, e.g. "Don't have an account? Sign up". */
  switchPrompt: string;
  switchLabel: string;
  switchHref: string;
  illustration: { src: string; alt: string };
  eyebrow: string;
  headline: string;
  description: string;
  highlights: string[];
};

export function AuthShell({
  children,
  switchPrompt,
  switchLabel,
  switchHref,
  illustration,
  eyebrow,
  headline,
  description,
  highlights,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-1 bg-white text-slate-900">
      {/* Form column */}
      <div className="flex w-full flex-col lg:w-1/2">
        <header className="flex items-center justify-between gap-4 px-6 pt-6 sm:px-10 sm:pt-8">
          <Link
            href="/"
            aria-label="MoreSo Tech home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/15"
          >
            <Image
              src="/moresotech-logo.png"
              alt="MoreSo Tech"
              width={865}
              height={288}
              priority
              className="h-16 w-auto sm:h-20"
            />
          </Link>
          <p className="hidden text-sm text-slate-500 sm:block">
            {switchPrompt}{" "}
            <Link
              href={switchHref}
              className="font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
            >
              {switchLabel}
            </Link>
          </p>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-3 duration-500">
            {children}
          </div>
        </main>

        <footer className="flex flex-col items-center justify-between gap-3 px-6 pb-6 text-xs text-slate-400 sm:flex-row sm:px-10 sm:pb-8">
          <p>&copy; {new Date().getFullYear()} MoreSo Tech. All rights reserved.</p>
          <nav className="flex items-center gap-5">
            <Link href="/" className="transition-colors hover:text-slate-600">
              Privacy
            </Link>
            <Link href="/" className="transition-colors hover:text-slate-600">
              Terms
            </Link>
            <Link href="/" className="transition-colors hover:text-slate-600">
              Help
            </Link>
          </nav>
        </footer>
      </div>

      {/* Illustration column */}
      <aside className="sticky top-0 hidden h-screen w-1/2 overflow-hidden border-l border-slate-100 bg-white lg:flex">
        {/* Soft brand glows and a faint dot grid keep the white panel from feeling empty */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-brand-blue/[0.06] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-[380px] rounded-full bg-brand-orange/[0.08] blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#0b5c9c14_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center px-12 py-16 xl:px-16">
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <Image
              src={illustration.src}
              alt={illustration.alt}
              width={500}
              height={500}
              priority
              unoptimized
              className="mx-auto h-auto w-full max-w-[440px] select-none"
            />
          </div>

          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange-dark">
              <span className="size-1.5 rounded-full bg-brand-orange" />
              {eyebrow}
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 xl:text-[2.125rem]">
              {headline}
            </h2>
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-slate-500">
              {description}
            </p>

            <ul className="mt-7 grid gap-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
