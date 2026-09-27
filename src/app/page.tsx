import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BellRing,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FolderLock,
  GraduationCap,
  ListVideo,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { CourseCover } from "@/components/learning/course-cover";
import { LocalTime } from "@/components/learning/time";
import { VerifyForm } from "@/components/landing/verify-form";
import { AnnouncementBar } from "@/components/shell/announcement-bar";
import { getProfile, homeFor } from "@/lib/auth";
import { getLandingData } from "@/lib/landing";
import { activeAnnouncement, getSiteSettings } from "@/lib/settings";
import { siteHeroUrl, whatsappLink } from "@/lib/settings-rules";
import { COURSE_CATEGORIES, formatDuration, formatPrice } from "@/lib/learning-rules";
import { FUNDING_LABELS, LEVEL_LABELS, deadlineInfo } from "@/lib/scholarship-labels";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "MoreSo Tech | Win a scholarship to study in South Korea",
  description:
    "Find open Korean scholarships, build the language skills and certificates they ask for, and apply with every document checked by our team.",
};

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Find the right scholarship",
    body: "Browse open scholarships with clear eligibility, benefits, required documents and live deadline countdowns.",
  },
  {
    icon: GraduationCap,
    title: "Prepare with expert courses",
    body: "Build the Korean language skills, test scores and interview confidence the selection panels look for, and earn a certificate.",
  },
  {
    icon: FileCheck2,
    title: "Apply with confidence",
    body: "Upload your documents to a private vault, get each one checked by our team, and track your application to the finish.",
  },
];

const FEATURES: { icon: LucideIcon; title: string; body: string; tone: string }[] = [
  { icon: FolderLock, title: "Private document vault", body: "Passports, transcripts and certificates stored privately. Only you and our reviewers can open them.", tone: "bg-brand-blue/10 text-brand-blue" },
  { icon: ShieldCheck, title: "Every document reviewed", body: "Our team checks each upload and tells you exactly what to fix before you submit.", tone: "bg-emerald-500/10 text-emerald-600" },
  { icon: BellRing, title: "Never miss a deadline", body: "A live countdown on every scholarship, and dashboard alerts as your application moves forward.", tone: "bg-amber-500/10 text-amber-600" },
  { icon: Video, title: "Live sessions", body: "Join Q&As and classes with our instructors on Zoom or Google Meet.", tone: "bg-violet-500/10 text-violet-600" },
  { icon: Award, title: "Verifiable certificates", body: "Each certificate has a code anyone can check online, so universities know it's genuine.", tone: "bg-brand-orange/10 text-brand-orange-dark" },
  { icon: Smartphone, title: "Pay the way you already do", body: "Buy courses securely with EcoCash, InnBucks, cards and more through Pesepay.", tone: "bg-rose-500/10 text-rose-600" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is it free to join?",
    a: "Yes. Creating an account, browsing scholarships, saving them and building your applications is free. Some courses and certificates are paid, and each shows its price upfront.",
  },
  {
    q: "Which scholarships can I find here?",
    a: "Scholarships to study in South Korea, from language programmes to undergraduate, master's and PhD funding. Each listing shows who can apply, what it covers and what documents you'll need.",
  },
  {
    q: "Who can see my documents?",
    a: "Only you and the MoreSo Tech reviewers working on your application. Files are kept in private storage, and every time a reviewer opens a document it's recorded.",
  },
  {
    q: "How do I pay for a course?",
    a: "At checkout you choose EcoCash, InnBucks, a card or another method offered by Pesepay. Mobile money sends a prompt to your phone; your course unlocks as soon as the payment is confirmed.",
  },
  {
    q: "Can a university check my certificate?",
    a: "Yes. Every certificate has a unique code. Anyone can enter it at the bottom of this page to confirm who it was issued to and when.",
  },
];

export default async function Home() {
  // Signed-in people go straight to their own area (sign-in also lands here after its welcome modal).
  const profile = await getProfile();
  if (profile) redirect(homeFor(profile.role));

  const [{ stats, featuredScholarships, featuredCourses, upcomingSessions }, site] = await Promise.all([getLandingData(), getSiteSettings()]);
  const announcement = activeAnnouncement(site);
  const statItems = [
    { value: stats.scholarships, label: stats.scholarships === 1 ? "Open scholarship" : "Open scholarships" },
    { value: stats.courses, label: stats.courses === 1 ? "Course" : "Courses" },
    { value: stats.sessions, label: stats.sessions === 1 ? "Upcoming live session" : "Upcoming live sessions" },
    { value: stats.certificates, label: stats.certificates === 1 ? "Certificate issued" : "Certificates issued" },
  ].filter((s) => s.value > 0);
  const heroCourse = featuredCourses.find((c) => c.coverImage);

  return (
    <div className="flex min-h-full flex-col bg-white text-slate-900">
      {announcement && <AnnouncementBar {...announcement} className="rounded-none px-4 py-2.5 sm:justify-center [&>p]:flex-none" />}
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-brand-blue/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -left-32 top-64 size-[26rem] rounded-full bg-brand-orange/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-blue/[0.07] px-3 py-1.5 text-xs font-semibold text-brand-blue ring-1 ring-brand-blue/15">
                <Sparkles className="size-3.5" /> Scholarships to study in South Korea
              </span>
              <h1 className="mt-5 font-heading text-[2.4rem] font-extrabold leading-[1.08] tracking-tight text-[#0f1b2d] sm:text-5xl lg:text-[3.6rem]">
                Get accepted into the scholarship that <span className="relative whitespace-nowrap text-brand-orange">changes everything<Underline /></span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Find open Korean scholarships, build the language skills and certificates they ask for, and apply with every document checked by our team.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sign-up"
                  className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-orange px-6 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgba(245,130,32,0.75)] transition hover:bg-brand-orange-dark"
                >
                  Create your free account <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#scholarships"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:ring-slate-300"
                >
                  See open scholarships
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {["Free to join", "Sign in with Google, Microsoft or LinkedIn", "Pay with EcoCash or card"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <HeroVisual heroUrl={siteHeroUrl(site.heroImage)} course={heroCourse} />
          </div>
        </section>

        {/* ── Live numbers ─────────────────────────────────────── */}
        {/* One lonely number looks emptier than none, so wait until there are a few to show. */}
        {statItems.length >= 2 && (
          <section aria-label="MoreSo Tech in numbers" className="border-y border-slate-100 bg-slate-50/70">
            <dl className={cn("mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:px-8", statItems.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : statItems.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1 text-center">
                  <dt className="text-sm font-medium text-slate-500">{s.label}</dt>
                  <dd className="font-heading text-3xl font-extrabold tracking-tight text-[#0f1b2d] sm:text-4xl">{s.value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ── How it works ─────────────────────────────────────── */}
        <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="How it works" title="From “I want to study in Korea” to an offer letter" body="Three clear steps, with our team beside you the whole way." />
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative rounded-3xl bg-white p-7 ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)]">
                  <span className="absolute right-6 top-6 font-heading text-5xl font-extrabold text-slate-100">{i + 1}</span>
                  <span className="relative flex size-12 items-center justify-center rounded-2xl bg-[#0f1b2d] text-white">
                    <s.icon className="size-6" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold text-[#0f1b2d]">{s.title}</h3>
                  <p className="relative mt-2 text-[0.95rem] leading-relaxed text-slate-600">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Scholarships ─────────────────────────────────────── */}
        <section id="scholarships" className="scroll-mt-20 bg-[#0f1b2d] py-20 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading dark align="left" eyebrow="Open now" title="Scholarships you can apply for" body="Fully and partly funded programmes, with everything you need to know in one place." />
              <Link href="/sign-up" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-[#f7a24f]">
                See every scholarship <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            {featuredScholarships.length ? (
              <div className="mt-12 grid gap-5 md:grid-cols-3">
                {featuredScholarships.map((s) => {
                  const deadline = deadlineInfo(s.deadline);
                  return (
                    <Link
                      key={s.id}
                      href={`/dashboard/scholarships/${s.slug}`}
                      className="group flex flex-col rounded-3xl bg-white/[0.05] p-6 ring-1 ring-white/10 transition hover:-translate-y-1 hover:bg-white/[0.08] hover:ring-white/20"
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">{FUNDING_LABELS[s.fundingType]}</span>
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200">{LEVEL_LABELS[s.level]}</span>
                      </div>
                      <h3 className="mt-4 text-lg font-bold leading-snug">{s.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{[s.provider, s.university].filter(Boolean).join(" · ")}</p>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">{s.summary}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-sm">
                        <span className={cn("inline-flex items-center gap-1.5 font-semibold", deadline.tone === "urgent" ? "text-red-300" : deadline.tone === "soon" ? "text-amber-300" : "text-slate-300")}>
                          <CalendarClock className="size-4" /> {deadline.label}
                        </span>
                        <span className="font-semibold text-brand-orange group-hover:underline">View</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-12 rounded-3xl bg-white/[0.05] px-6 py-10 text-center text-slate-300 ring-1 ring-white/10">
                New scholarships are being added. Create a free account and you&apos;ll see them the moment they open.
              </p>
            )}
          </div>
        </section>

        {/* ── Courses ──────────────────────────────────────────── */}
        {featuredCourses.length > 0 && (
          <section id="courses" className="scroll-mt-20 py-20 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <SectionHeading align="left" eyebrow="Courses & certificates" title="Build what scholarship panels look for" body="Language, test preparation, documents and interviews, taught by our instructors." />
                <Link href="/sign-up" className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
                  Browse all courses <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredCourses.map((c) => {
                  const instructor = [c.instructorFirst, c.instructorLast].filter(Boolean).join(" ");
                  return (
                    <Link
                      key={c.id}
                      href={`/dashboard/courses/${c.slug}`}
                      className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(15,23,42,0.3)]"
                    >
                      <div className="relative overflow-hidden">
                        <CourseCover course={c} className="aspect-[16/9] transition duration-500 group-hover:scale-[1.03]" />
                        <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                          {COURSE_CATEGORIES[c.category] ?? "Course"}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-lg font-bold leading-snug text-[#0f1b2d]">{c.title}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{c.subtitle}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <ListVideo className="size-3.5" /> {c.lessonCount} lesson{c.lessonCount === 1 ? "" : "s"}
                          </span>
                          {c.awardsCertificate && (
                            <span className="inline-flex items-center gap-1 text-brand-orange-dark">
                              <Award className="size-3.5" /> Certificate
                            </span>
                          )}
                          {instructor && <span>by {instructor}</span>}
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-6">
                          <span className="text-xl font-extrabold text-[#0f1b2d]">{c.priceCents ? formatPrice(c.priceCents, c.currency) : "Free"}</span>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                            View course <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="scroll-mt-20 bg-slate-50/80 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Why MoreSo Tech" title="Everything for your application, in one place" body="No more scattered emails, lost documents or missed deadlines." />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
                  <span className={cn("flex size-11 items-center justify-center rounded-2xl", f.tone)}>
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-[#0f1b2d]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Live sessions ────────────────────────────────────── */}
        {upcomingSessions.length > 0 && (
          <section id="sessions" className="scroll-mt-20 py-20 sm:py-24">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
              <SectionHeading align="left" eyebrow="Live sessions" title="Learn live with our instructors" body="Ask your questions in real time. Sign up free to register; you'll get the link when the room opens." />
              <ul className="space-y-3">
                {upcomingSessions.map((w) => (
                  <li key={w.id} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
                    <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0f1b2d] text-white">
                      <Video className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#0f1b2d]">{w.title}</p>
                      <p className="truncate text-sm text-slate-500">
                        <LocalTime iso={w.startsAt.toISOString()} /> · {formatDuration(w.durationMinutes)} · {w.hostName}
                      </p>
                    </div>
                    <span className={cn("hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:inline", w.access === "everyone" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700")}>
                      {w.access === "everyone" ? "Open to all" : "Course students"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 border-t border-slate-100 py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading eyebrow="Questions" title="Frequently asked questions" />
            <div className="mt-12 divide-y divide-slate-200 rounded-3xl ring-1 ring-slate-200">
              {FAQS.map((f) => (
                <details key={f.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-semibold text-[#0f1b2d]">
                    {f.q}
                    <span aria-hidden className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-brand-orange/10 group-open:text-brand-orange">
                      +
                    </span>
                  </summary>
                  <p className="-mt-1 pb-5 text-[0.95rem] leading-relaxed text-slate-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final call to action ─────────────────────────────── */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0f1b2d] px-6 py-14 text-center text-white sm:px-12 sm:py-16">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-blue/40 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-10 size-72 rounded-full bg-brand-orange/25 blur-3xl" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Your Korean scholarship starts with one free account</h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-300">Save scholarships, start your application and get your documents reviewed. Joining takes about a minute.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/sign-up" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-orange px-6 text-base font-bold text-white shadow-[0_14px_30px_-12px_rgba(245,130,32,0.75)] transition hover:bg-brand-orange-dark">
                  Get started free <ArrowRight className="size-5" />
                </Link>
                <Link href="/sign-in" className="inline-flex h-13 items-center justify-center rounded-2xl bg-white/10 px-6 text-base font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15">
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter supportEmail={site.supportEmail} supportWhatsapp={site.supportWhatsapp} />
    </div>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function SiteHeader() {
  const links = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#scholarships", label: "Scholarships" },
    { href: "#courses", label: "Courses" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MoreSo Tech home" className="shrink-0">
          <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} preload className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden h-10 items-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">
            Sign in
          </Link>
          <Link href="/sign-up" className="inline-flex h-10 items-center rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Illustration with floating cards that preview what the student dashboard does. */
function HeroVisual({ heroUrl, course }: { heroUrl: string | null; course?: { id: string; title: string; category: string; coverImage: string | null } }) {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-blue/[0.08] via-white to-brand-orange/[0.08] ring-1 ring-slate-200/70">
        {heroUrl ? (
          <Image src={heroUrl} alt="" fill unoptimized preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        ) : course ? (
          <CourseCover course={course} preload sizes="(min-width: 1024px) 45vw, 100vw" className="absolute inset-0" />
        ) : (
          <Image src="/illustrations/sign-up.svg" alt="" fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-contain p-8" />
        )}
      </div>

      <FloatingCard className="-left-3 top-8 sm:-left-8">
        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <BadgeCheck className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0f1b2d]">Document verified</p>
          <p className="text-xs text-slate-500">Checked by a reviewer</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-right-2 bottom-24 sm:-right-6">
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
          <CalendarClock className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0f1b2d]">Deadline reminder</p>
          <p className="text-xs text-slate-500">On your dashboard</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-bottom-5 left-6 sm:left-12">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange-dark">
          <Award className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-[#0f1b2d]">Certificate earned</p>
          <p className="text-xs text-slate-500">With a verification code</p>
        </div>
      </FloatingCard>
    </div>
  );
}

function FloatingCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute flex items-center gap-3 rounded-2xl bg-white/95 py-3 pl-3 pr-5 shadow-[0_20px_40px_-18px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, body, align = "center", dark }: { eyebrow: string; title: string; body?: string; align?: "center" | "left"; dark?: boolean }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn("text-sm font-bold uppercase tracking-[0.16em]", dark ? "text-brand-orange" : "text-brand-blue")}>{eyebrow}</p>
      <h2 className={cn("mt-3 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl", dark ? "text-white" : "text-[#0f1b2d]")}>{title}</h2>
      {body && <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>{body}</p>}
    </div>
  );
}

function Underline() {
  return (
    <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-3 w-full text-brand-orange/40">
      <path d="M2 9c60-6 140-8 296-3" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function SiteFooter({ supportEmail, supportWhatsapp }: { supportEmail: string | null; supportWhatsapp: string | null }) {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} className="h-9 w-auto" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">Helping students prepare for, apply to and win scholarships to study in South Korea.</p>
          {(supportEmail || supportWhatsapp) && (
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="font-semibold text-slate-700 hover:text-brand-blue">
                  {supportEmail}
                </a>
              )}
              {supportWhatsapp && (
                <a href={whatsappLink(supportWhatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-700 hover:text-emerald-800">
                  WhatsApp {supportWhatsapp}
                </a>
              )}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-[#0f1b2d]">Check a MoreSo Tech certificate</p>
          <p className="mt-1 text-sm text-slate-500">Enter the code printed on the certificate.</p>
          <div className="mt-3">
            <VerifyForm />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} MoreSo Tech. All rights reserved.</p>
          <p>
            Illustrations by{" "}
            <a href="https://storyset.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Storyset
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
