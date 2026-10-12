import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Award, CalendarClock, Check, ListVideo, MessageCircle, Plane, Video } from "lucide-react";
import { CourseCover } from "@/components/learning/course-cover";
import { LocalTime } from "@/components/learning/time";
import { Float, Marquee, MotionProvider, Parallax, PhotoReveal, Reveal, RouteProgress, Stagger, StaggerItem, WordsReveal } from "@/components/landing/motion";
import { Photo } from "@/components/landing/photo";
import { VerifyForm } from "@/components/landing/verify-form";
import { AnnouncementBar } from "@/components/shell/announcement-bar";
import { getProfile, homeFor } from "@/lib/auth";
import { getLandingData } from "@/lib/landing";
import { PHOTO_CREDITS, PHOTOS, type LandingPhoto } from "@/lib/landing-photos";
import { COURSE_CATEGORIES, formatDuration, formatPrice } from "@/lib/learning-rules";
import { FUNDING_LABELS, LEVEL_LABELS, deadlineInfo } from "@/lib/scholarship-labels";
import { activeAnnouncement, getSiteSettings } from "@/lib/settings";
import { siteHeroUrl, whatsappLink } from "@/lib/settings-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "MoreSo Tech | From Harare to Seoul: win a scholarship to study in South Korea",
  description:
    "Find open Korean scholarships, learn Korean and prepare for TOPIK, and apply with every document checked by our team. Built for students in Zimbabwe.",
};

/** The four stops of the journey section. */
const JOURNEY: { place: string; korean?: string; title: string; body: string; photo: LandingPhoto }[] = [
  {
    place: "Harare",
    korean: "하라레",
    title: "Find a scholarship you can actually win",
    body: "Every open scholarship in one place, with who can apply, what it covers, the documents it needs and a live countdown to the deadline. Save the ones that fit you.",
    photo: PHOTOS.harareFriends,
  },
  {
    place: "Prepare",
    title: "Learn Korean and build your profile",
    body: "Courses for TOPIK, documents and interviews, live sessions with instructors, and a certificate with a code any university can check.",
    photo: PHOTOS.studyingBraids,
  },
  {
    place: "Apply",
    title: "Send an application with nothing missing",
    body: "Upload to a private vault. Our team reviews every document and tells you exactly what to fix before you submit.",
    photo: PHOTOS.studyGroup,
  },
  {
    place: "Seoul",
    korean: "서울",
    title: "Start your degree in South Korea",
    body: "Track your application to the decision, with updates on your dashboard at every step.",
    photo: PHOTOS.seoulNight,
  },
];

const TICKER = ["Open scholarships", "Korean language", "TOPIK preparation", "Document checks", "Interview practice", "Live sessions", "Verified certificates", "Pay with EcoCash"];

const LOCAL_POINTS: { title: string; body: string }[] = [
  { title: "Pay the way you already do", body: "EcoCash, InnBucks, cards and more through Pesepay. Prices in US dollars, no surprises." },
  { title: "Your documents stay private", body: "Passports and transcripts are stored privately. Only you and your reviewer can open them, and every view is logged." },
  { title: "Times in your time zone", body: "Live sessions and deadlines show in your local time, so 15:00 in Seoul never catches you out." },
  { title: "Free to start", body: "Browse, save scholarships and build applications for free. Paid courses show the price upfront." },
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
  const heroUrl = siteHeroUrl(site.heroImage);
  const statItems = [
    { value: stats.scholarships, label: stats.scholarships === 1 ? "open scholarship" : "open scholarships" },
    { value: stats.courses, label: stats.courses === 1 ? "course" : "courses" },
    { value: stats.sessions, label: stats.sessions === 1 ? "live session coming up" : "live sessions coming up" },
    { value: stats.certificates, label: stats.certificates === 1 ? "certificate issued" : "certificates issued" },
  ].filter((s) => s.value > 0);

  return (
    <MotionProvider>
      <div className="flex min-h-full flex-col bg-white text-slate-900">
        {announcement && <AnnouncementBar {...announcement} className="rounded-none px-4 py-2.5 sm:justify-center [&>p]:flex-none" />}
        <SiteHeader />

        <main className="flex-1 overflow-x-clip">
          {/* ── Hero ─────────────────────────────────────────────── */}
          <section className="relative">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-6 lg:px-8 lg:pb-28 lg:pt-14">
              <div className="lg:col-span-6">
                <Reveal y={12}>
                  <p className="inline-flex items-center gap-3 text-sm font-semibold text-slate-600">
                    <span lang="ko" className="rounded-md bg-[#0f1b2d] px-2 py-1 text-xs font-bold tracking-wider text-white">
                      장학금
                    </span>
                    Scholarships to study in South Korea
                  </p>
                </Reveal>
                <WordsReveal
                  className="mt-6 font-heading text-[3.1rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-[#0f1b2d] sm:text-7xl lg:text-[5.6rem]"
                  lines={[{ text: "From Harare" }, { text: "to Seoul.", accent: true }]}
                />
                <Reveal delay={0.55}>
                  <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-600">
                    Find the Korean scholarship that fits you, learn the language, and apply with every document checked by people who know what the panels look for.
                  </p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/sign-up"
                      className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-orange px-7 text-base font-bold text-white shadow-[0_18px_36px_-14px_rgba(245,130,32,0.8)] transition hover:-translate-y-0.5 hover:bg-brand-orange-dark"
                    >
                      Start your journey <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                      href="#journey"
                      className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold text-[#0f1b2d] ring-1 ring-slate-300 transition hover:bg-slate-50"
                    >
                      See how it works
                    </a>
                  </div>
                  <p className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    {["Free to join", "Pay with EcoCash", "Google, Microsoft or LinkedIn sign-in"].map((t) => (
                      <span key={t} className="inline-flex items-center gap-1.5">
                        <Check className="size-4 text-emerald-600" strokeWidth={3} /> {t}
                      </span>
                    ))}
                  </p>
                </Reveal>
              </div>

              <HeroCollage heroUrl={heroUrl} />
            </div>
          </section>

          {/* ── Ticker ───────────────────────────────────────────── */}
          <div className="bg-[#0f1b2d] py-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/85">
            <Marquee items={TICKER} />
          </div>

          {/* ── Live numbers (only once there's enough to say) ───── */}
          {statItems.length >= 2 && (
            <section aria-label="MoreSo Tech in numbers" className="border-b border-slate-100">
              <Stagger className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-16 gap-y-6 px-4 py-12 sm:px-6 lg:px-8">
                {statItems.map((s) => (
                  <StaggerItem key={s.label} className="flex items-baseline gap-2.5">
                    <span className="font-heading text-4xl font-extrabold tracking-tight text-[#0f1b2d]">{s.value.toLocaleString()}</span>
                    <span className="text-sm font-medium text-slate-500">{s.label}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </section>
          )}

          {/* ── The journey ──────────────────────────────────────── */}
          <section id="journey" className="scroll-mt-20 bg-[#f7f3ec] py-24 sm:py-32">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <Reveal className="max-w-2xl">
                <Eyebrow>How it works</Eyebrow>
                <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-[3.4rem]">
                  One route, four stops.
                  <span className="block text-slate-400">We walk it with you.</span>
                </h2>
              </Reveal>

              <RouteProgress className="mt-20">
                <ol className="space-y-20 md:space-y-28">
                  {JOURNEY.map((stop, i) => (
                    <JourneyStop key={stop.place} stop={stop} index={i} />
                  ))}
                </ol>
              </RouteProgress>
            </div>
          </section>

          {/* ── Scholarships ─────────────────────────────────────── */}
          <section id="scholarships" className="scroll-mt-20 bg-[#0f1b2d] py-24 text-white sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <Reveal className="max-w-2xl">
                  <Eyebrow dark>Open now</Eyebrow>
                  <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">Scholarships you can apply for</h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <Link href="/sign-up" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-[#f7a24f]">
                    See every scholarship <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>
              </div>
              {featuredScholarships.length ? (
                <Stagger className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 md:grid-cols-3">
                  {featuredScholarships.map((s) => {
                    const deadline = deadlineInfo(s.deadline);
                    return (
                      <StaggerItem key={s.id} className="bg-[#0f1b2d]">
                        <Link href={`/dashboard/scholarships/${s.slug}`} className="group flex h-full flex-col p-7 transition-colors hover:bg-white/[0.04]">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                            {FUNDING_LABELS[s.fundingType]} · {LEVEL_LABELS[s.level]}
                          </p>
                          <h3 className="mt-4 text-xl font-bold leading-snug">{s.title}</h3>
                          <p className="mt-1 text-sm text-slate-400">{[s.provider, s.university].filter(Boolean).join(" · ")}</p>
                          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">{s.summary}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-8 text-sm">
                            <span className={cn("inline-flex items-center gap-1.5 font-semibold", deadline.tone === "urgent" ? "text-red-300" : deadline.tone === "soon" ? "text-amber-300" : "text-slate-300")}>
                              <CalendarClock className="size-4" /> {deadline.label}
                            </span>
                            <ArrowUpRight className="size-5 text-brand-orange transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              ) : (
                <Reveal>
                  <div className="mt-14 grid items-center gap-8 overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 md:grid-cols-[1fr_1.1fr]">
                    <div className="p-8 sm:p-10">
                      <p className="text-2xl font-bold leading-snug">The next intake is being added now.</p>
                      <p className="mt-3 text-slate-300">Create a free account and you&apos;ll see each scholarship the moment it opens, with its deadline counting down on your dashboard.</p>
                      <Link href="/sign-up" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#0f1b2d] transition hover:bg-slate-100">
                        Get notified first <ArrowRight className="size-4" />
                      </Link>
                    </div>
                    <div className="relative h-64 md:h-full md:min-h-80">
                      <Photo photo={PHOTOS.seoulCampus} sizes="(min-width: 768px) 50vw, 100vw" />
                    </div>
                  </div>
                </Reveal>
              )}
            </div>
          </section>

          {/* ── Courses ──────────────────────────────────────────── */}
          {featuredCourses.length > 0 && (
            <section id="courses" className="scroll-mt-20 py-24 sm:py-28">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                  <Reveal className="max-w-2xl">
                    <Eyebrow>Courses & certificates</Eyebrow>
                    <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Build what the panels look for</h2>
                  </Reveal>
                  <Reveal delay={0.1}>
                    <Link href="/sign-up" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue">
                      Browse all courses <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Reveal>
                </div>
                <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredCourses.map((c) => {
                    const instructor = [c.instructorFirst, c.instructorLast].filter(Boolean).join(" ");
                    return (
                      <StaggerItem key={c.id}>
                        <Link href={`/dashboard/courses/${c.slug}`} className="group block">
                          <div className="relative overflow-hidden rounded-3xl">
                            <CourseCover course={c} className="aspect-[4/3] transition duration-700 group-hover:scale-[1.04]" />
                            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f1b2d] backdrop-blur">
                              {c.priceCents ? formatPrice(c.priceCents, c.currency) : "Free"}
                            </span>
                          </div>
                          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-blue">{COURSE_CATEGORIES[c.category] ?? "Course"}</p>
                          <h3 className="mt-2 text-xl font-bold leading-snug text-[#0f1b2d] decoration-brand-orange decoration-2 underline-offset-4 group-hover:underline">{c.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{c.subtitle}</p>
                          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <ListVideo className="size-3.5" /> {c.lessonCount} lesson{c.lessonCount === 1 ? "" : "s"}
                            </span>
                            {c.awardsCertificate && (
                              <span className="inline-flex items-center gap-1 text-brand-orange-dark">
                                <Award className="size-3.5" /> Certificate
                              </span>
                            )}
                            {instructor && <span>with {instructor}</span>}
                          </p>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </div>
            </section>
          )}

          {/* ── Made for Zimbabwe ────────────────────────────────── */}
          <section id="local" className="scroll-mt-20 bg-[#f7f3ec] py-24 sm:py-32">
            <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
              <div className="relative">
                <PhotoReveal className="relative aspect-[4/5] rounded-[28px] sm:aspect-[5/4] lg:aspect-[4/5]">
                  <Parallax offset={30} className="absolute -inset-y-10 inset-x-0">
                    <Photo photo={PHOTOS.campusBench} sizes="(min-width: 1024px) 45vw, 100vw" />
                  </Parallax>
                </PhotoReveal>
                <Float delay={0.6} className="absolute -bottom-6 right-4 sm:right-8">
                  <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_24px_50px_-20px_rgba(15,27,45,0.45)]">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#e11b22]/10 text-sm font-black text-[#c8161d]">$</span>
                    <div>
                      <p className="text-sm font-bold text-[#0f1b2d]">Paid with EcoCash</p>
                      <p className="text-xs text-slate-500">Course unlocked instantly</p>
                    </div>
                  </div>
                </Float>
              </div>

              <div>
                <Reveal>
                  <Eyebrow>Made for students in Zimbabwe</Eyebrow>
                  <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Built around how you study, pay and stay in touch.</h2>
                </Reveal>
                <Stagger as="ul" className="mt-10 divide-y divide-[#0f1b2d]/10 border-y border-[#0f1b2d]/10">
                  {LOCAL_POINTS.map((p, i) => (
                    <StaggerItem as="li" key={p.title} className="flex gap-5 py-5">
                      <span className="font-heading text-sm font-extrabold text-brand-orange">0{i + 1}</span>
                      <div>
                        <p className="font-bold text-[#0f1b2d]">{p.title}</p>
                        <p className="mt-1 text-[0.95rem] leading-relaxed text-slate-600">{p.body}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
                {site.supportWhatsapp && (
                  <Reveal delay={0.2}>
                    <a
                      href={whatsappLink(site.supportWhatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      <MessageCircle className="size-4" /> Ask us on WhatsApp
                    </a>
                  </Reveal>
                )}
              </div>
            </div>
          </section>

          {/* ── Live sessions ────────────────────────────────────── */}
          {upcomingSessions.length > 0 && (
            <section id="sessions" className="scroll-mt-20 py-24 sm:py-28">
              <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8">
                <Reveal>
                  <Eyebrow>Live sessions</Eyebrow>
                  <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Ask your questions, live.</h2>
                  <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600">Sign up free to register. You&apos;ll get the link when the room opens.</p>
                </Reveal>
                <Stagger as="ul" className="divide-y divide-slate-200 border-y border-slate-200">
                  {upcomingSessions.map((w) => (
                    <StaggerItem as="li" key={w.id} className="flex items-center gap-5 py-5">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0f1b2d] text-white">
                        <Video className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-lg font-bold text-[#0f1b2d]">{w.title}</p>
                        <p className="truncate text-sm text-slate-500">
                          <LocalTime iso={w.startsAt.toISOString()} /> · {formatDuration(w.durationMinutes)} · {w.hostName}
                        </p>
                      </div>
                      <span className={cn("hidden shrink-0 text-xs font-bold uppercase tracking-wider sm:inline", w.access === "everyone" ? "text-emerald-700" : "text-violet-700")}>
                        {w.access === "everyone" ? "Open to all" : "Course students"}
                      </span>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </section>
          )}

          {/* ── FAQ ──────────────────────────────────────────────── */}
          <section id="faq" className="scroll-mt-20 border-t border-slate-100 py-24 sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
              <Reveal>
                <Eyebrow>Questions</Eyebrow>
                <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f1b2d] sm:text-5xl">Before you start</h2>
                {site.supportEmail && (
                  <p className="mt-4 text-slate-600">
                    Something else?{" "}
                    <a href={`mailto:${site.supportEmail}`} className="font-semibold text-brand-blue underline-offset-4 hover:underline">
                      {site.supportEmail}
                    </a>
                  </p>
                )}
              </Reveal>
              <Reveal delay={0.1}>
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {FAQS.map((f) => (
                    <details key={f.q} className="group [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-bold text-[#0f1b2d]">
                        {f.q}
                        <span aria-hidden className="relative size-5 shrink-0">
                          <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded bg-brand-orange" />
                          <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 rounded bg-brand-orange transition-transform duration-300 group-open:scale-y-0" />
                        </span>
                      </summary>
                      <p className="-mt-2 pb-6 pr-10 leading-relaxed text-slate-600">{f.a}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Final call to action ─────────────────────────────── */}
          <section className="px-4 pb-6 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem]">
              <Parallax offset={40} className="absolute -inset-y-16 inset-x-0">
                <Photo photo={PHOTOS.graduatesGroup} sizes="100vw" />
              </Parallax>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f1b2d] via-[#0f1b2d]/85 to-[#0f1b2d]/30" />
              <div className="relative px-6 py-20 text-white sm:px-14 sm:py-28">
                <Reveal className="max-w-xl">
                  <p lang="ko" className="font-heading text-sm font-bold tracking-[0.3em] text-brand-orange">
                    합격 · ACCEPTED
                  </p>
                  <h2 className="mt-4 font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl">Your offer letter starts here.</h2>
                  <p className="mt-5 text-lg text-slate-200">Save scholarships, start your application and get your documents reviewed. Joining takes about a minute.</p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link href="/sign-up" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-orange px-7 text-base font-bold text-white transition hover:bg-brand-orange-dark">
                      Create your free account <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/sign-in" className="inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-semibold text-white ring-1 ring-white/40 transition hover:bg-white/10">
                      I have an account
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter supportEmail={site.supportEmail} supportWhatsapp={site.supportWhatsapp} />
      </div>
    </MotionProvider>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function SiteHeader() {
  const links = [
    { href: "#journey", label: "How it works" },
    { href: "#scholarships", label: "Scholarships" },
    { href: "#local", label: "Why us" },
    { href: "#faq", label: "FAQ" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:px-8">
        <Link href="/" aria-label="MoreSo Tech home" className="shrink-0">
          <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} preload className="h-9 w-auto sm:h-10" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-slate-600 transition hover:text-[#0f1b2d]">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden h-10 items-center rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex">
            Sign in
          </Link>
          <Link href="/sign-up" className="inline-flex h-10 items-center rounded-full bg-[#0f1b2d] px-5 text-sm font-semibold text-white transition hover:bg-[#1a2a42]">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Three photos and a boarding pass, layered, each moving at its own pace. */
function HeroCollage({ heroUrl }: { heroUrl: string | null }) {
  return (
    <div className="relative mx-auto h-[30rem] w-full max-w-xl sm:h-[36rem] lg:col-span-6 lg:max-w-none">
      {/* Main portrait (an admin-uploaded picture replaces it) */}
      <PhotoReveal className="absolute right-0 top-0 h-[88%] w-[72%] rounded-[28px] shadow-[0_40px_80px_-40px_rgba(15,27,45,0.55)]">
        {heroUrl ? (
          <Image src={heroUrl} alt="" fill unoptimized preload sizes="(min-width: 1024px) 36vw, 72vw" className="object-cover" />
        ) : (
          <Photo photo={PHOTOS.graduateCertificate} preload sizes="(min-width: 1024px) 36vw, 72vw" />
        )}
      </PhotoReveal>

      {/* Seoul, small, top left */}
      <Parallax offset={-24} className="absolute left-0 top-4 z-10 w-[36%]">
        <PhotoReveal delay={0.25} className="relative aspect-[4/5] rounded-[22px] ring-8 ring-white">
          <Photo photo={PHOTOS.seoulCampus} sizes="(min-width: 1024px) 18vw, 36vw" />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold text-slate-600 backdrop-blur">
            <span lang="ko" className="font-bold text-[#0f1b2d]">
              서울
            </span>{" "}
            · Seoul
          </span>
        </PhotoReveal>
      </Parallax>

      {/* Student at work, bottom left */}
      <Parallax offset={36} className="absolute bottom-2 left-[5%] z-10 w-[40%]">
        <PhotoReveal delay={0.4} className="relative aspect-square rounded-[22px] ring-8 ring-white">
          <Photo photo={PHOTOS.studentLaptop} sizes="(min-width: 1024px) 20vw, 44vw" />
        </PhotoReveal>
      </Parallax>

      {/* Boarding pass */}
      <Float delay={1} className="absolute -bottom-4 right-2 z-20 w-[min(19rem,78%)] sm:right-6">
        <BoardingPass />
      </Float>
    </div>
  );
}

function BoardingPass() {
  return (
    <div aria-hidden className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-24px_rgba(15,27,45,0.5)] ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between bg-[#0f1b2d] px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/80">
        <span>Boarding pass</span>
        <span className="text-brand-orange">Scholar class</span>
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div>
          <p className="font-heading text-3xl font-extrabold leading-none text-[#0f1b2d]">HRE</p>
          <p className="mt-1 text-[0.7rem] text-slate-500">Harare</p>
        </div>
        <div className="relative flex flex-1 items-center">
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-300" />
          <Plane className="mx-1 size-5 rotate-45 text-brand-orange" />
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-300" />
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-extrabold leading-none text-[#0f1b2d]">ICN</p>
          <p className="mt-1 text-[0.7rem] text-slate-500">Seoul Incheon</p>
        </div>
      </div>
      <div className="relative border-t-2 border-dashed border-slate-200 px-4 py-3">
        <span className="absolute -left-2.5 -top-2.5 size-5 rounded-full bg-white ring-1 ring-slate-200/70 [clip-path:inset(50%_0_0_50%)]" />
        <div className="grid grid-cols-3 text-[0.65rem] uppercase tracking-wider text-slate-400">
          <span>
            Passenger
            <span className="mt-0.5 block text-xs font-bold normal-case tracking-normal text-[#0f1b2d]">You</span>
          </span>
          <span>
            Gate
            <span className="mt-0.5 block text-xs font-bold normal-case tracking-normal text-[#0f1b2d]">Apply</span>
          </span>
          <span>
            Seat
            <span className="mt-0.5 block text-xs font-bold normal-case tracking-normal text-[#0f1b2d]">Funded</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function JourneyStop({ stop, index }: { stop: (typeof JOURNEY)[number]; index: number }) {
  const flip = index % 2 === 1;
  return (
    <li className="relative grid gap-8 pl-12 md:grid-cols-2 md:gap-16 md:pl-0">
      {/* Marker on the route line */}
      <span className="absolute left-[1.15rem] top-1 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-[#0f1b2d] text-sm font-extrabold text-white ring-[6px] ring-[#f7f3ec] md:left-1/2">
        {index + 1}
      </span>

      <Reveal className={cn("md:pt-1", flip ? "md:order-2 md:pl-14" : "md:pr-14 md:text-right")}>
        <p className="flex items-baseline gap-3 text-sm font-bold uppercase tracking-[0.2em] text-brand-orange md:inline-flex">
          {stop.place}
          {stop.korean && (
            <span lang="ko" className="text-xs tracking-normal text-slate-400">
              {stop.korean}
            </span>
          )}
        </p>
        <h3 className="mt-3 font-heading text-2xl font-extrabold leading-tight tracking-tight text-[#0f1b2d] sm:text-3xl">{stop.title}</h3>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-slate-600">{stop.body}</p>
      </Reveal>

      <div className={cn(flip ? "md:order-1 md:pr-14" : "md:pl-14")}>
        <PhotoReveal className="relative aspect-[4/3] rounded-[24px] shadow-[0_30px_60px_-36px_rgba(15,27,45,0.6)]">
          <Parallax offset={22} className="absolute -inset-y-8 inset-x-0">
            <Photo photo={stop.photo} sizes="(min-width: 768px) 40vw, 90vw" />
          </Parallax>
        </PhotoReveal>
      </div>
    </li>
  );
}

function Eyebrow({ children, dark }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={cn("flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]", dark ? "text-brand-orange" : "text-brand-blue")}>
      <span aria-hidden className={cn("h-px w-8", dark ? "bg-brand-orange" : "bg-brand-blue")} />
      {children}
    </p>
  );
}

function SiteFooter({ supportEmail, supportWhatsapp }: { supportEmail: string | null; supportWhatsapp: string | null }) {
  return (
    <footer className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} className="h-9 w-auto" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">Helping students in Zimbabwe prepare for, apply to and win scholarships to study in South Korea.</p>
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
        <div className="mx-auto max-w-7xl space-y-2 px-4 py-6 text-xs text-slate-400 sm:px-6 lg:px-8">
          <p>
            Photos on{" "}
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              Unsplash
            </a>{" "}
            by{" "}
            {PHOTO_CREDITS.map((c, i) => (
              <span key={c.creditUrl}>
                <a href={c.creditUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                  {c.credit}
                </a>
                {i < PHOTO_CREDITS.length - 2 ? ", " : i === PHOTO_CREDITS.length - 2 ? " and " : "."}
              </span>
            ))}
          </p>
          <p>© {new Date().getFullYear()} MoreSo Tech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

