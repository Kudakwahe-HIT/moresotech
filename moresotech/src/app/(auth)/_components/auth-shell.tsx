import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";

type AuthShellProps = {
  children: ReactNode;
  illustration: { src: string; alt: string };
  eyebrow: string;
  headline: string;
  description: string;
  highlights: string[];
};

export function AuthShell({ children, illustration, eyebrow, headline, description, highlights }: AuthShellProps) {
  return (
    <div className="flex h-dvh flex-1 overflow-hidden bg-white text-slate-900">
      {/* Form column */}
      <div className="flex w-full flex-col lg:w-1/2">
        <main className="flex min-h-0 flex-1 overflow-y-auto px-6 sm:px-10">
          <div className="m-auto w-full max-w-[420px] py-6 animate-in fade-in slide-in-from-bottom-3 duration-500 short:py-3">
            <Link
              href="/"
              aria-label="MoreSo Tech home"
              className="mx-auto mb-6 block w-fit rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/15 short:mb-4"
            >
              <Image
                src="/moresotech-logo.png"
                alt="MoreSo Tech"
                width={865}
                height={288}
                priority
                className="h-20 w-auto short:h-14"
              />
            </Link>
            {children}
          </div>
        </main>

        <footer className="flex shrink-0 items-center justify-between gap-3 px-6 pb-5 text-xs text-slate-400 sm:px-10 short:pb-3">
          <p>&copy; {new Date().getFullYear()} MoreSo Tech</p>
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
      <aside className="relative hidden w-1/2 overflow-hidden border-l border-slate-100 bg-white lg:flex">
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

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center px-12 py-8 xl:px-16">
          <div className="animate-in fade-in zoom-in-95 duration-700">
            <Image
              src={illustration.src}
              alt={illustration.alt}
              width={500}
              height={500}
              priority
              unoptimized
              className="mx-auto h-auto max-h-[46dvh] w-auto max-w-full select-none"
            />
          </div>

          <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange-dark">
              <span className="size-1.5 rounded-full bg-brand-orange" />
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-slate-900 short:text-2xl xl:text-[2.125rem]">
              {headline}
            </h2>
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-slate-500 short:mt-2 short:text-sm">
              {description}
            </p>

            <ul className="mt-6 grid gap-3 short:mt-4 short:gap-2">
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
