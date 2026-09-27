import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  Building2,
  CalendarClock,
  CircleCheck,
  CircleDollarSign,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { DeadlineChip } from "@/components/scholarships/deadline-chip";
import { SaveButton } from "@/components/scholarships/save-button";
import { requireRole } from "@/lib/auth";
import { deadlineInfo, formatDate, FUNDING_LABELS, LEVEL_LABELS } from "@/lib/scholarship-labels";
import { getPublishedScholarship } from "@/lib/scholarships";

export async function generateMetadata({ params }: PageProps<"/dashboard/scholarships/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = await requireRole("student", "instructor", "admin");
  const s = await getPublishedScholarship(slug, profile.id);
  return { title: s ? `${s.title} | MoreSo Tech` : "Scholarship | MoreSo Tech" };
}

export default async function ScholarshipPage({ params }: PageProps<"/dashboard/scholarships/[slug]">) {
  const { slug } = await params;
  const profile = await requireRole("student", "instructor", "admin");
  const s = await getPublishedScholarship(slug, profile.id);
  if (!s) notFound();

  const closed = deadlineInfo(s.deadline).tone === "closed";
  const requirements = [
    ...s.requiredDocuments.map((label) => ({ label, kind: "document" as const })),
    ...s.requiredCertificates.map((label) => ({ label, kind: "certificate" as const })),
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/scholarships"
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        All scholarships
      </Link>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0f1b2d] p-6 text-white sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-brand-blue/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            {s.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-white">
                <Sparkles className="size-3" /> Featured
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
              <ShieldCheck className="size-3.5" /> Verified by MoreSo Tech
            </span>
          </div>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight sm:text-3xl">{s.title}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
            <Building2 className="size-4" />
            {s.university ? `${s.university} · ${s.provider}` : s.provider}
          </p>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-slate-300">{s.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              aria-disabled
              title="Applications open in the next release"
              className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-xl bg-brand-orange/40 px-5 text-sm font-semibold text-white/80"
            >
              <ClipboardCheck className="size-4" />
              {closed ? "Applications closed" : "Start application · coming soon"}
            </span>
            <SaveButton scholarshipId={s.id} title={s.title} saved={s.saved} variant="full" onDark />
            {s.applyUrl && (
              <a
                href={s.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                Official website <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {s.description && (
            <Section title="About this scholarship">
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{s.description}</p>
            </Section>
          )}
          {s.eligibility.length > 0 && (
            <Section title="Who can apply">
              <CheckList items={s.eligibility} tone="blue" />
            </Section>
          )}
          {s.benefits.length > 0 && (
            <Section title="What you get">
              <CheckList items={s.benefits} tone="green" />
            </Section>
          )}
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">Key facts</h3>
              <DeadlineChip deadline={s.deadline} />
            </div>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <Fact icon={GraduationCap} label="Level" value={LEVEL_LABELS[s.level]} />
              <Fact icon={CircleDollarSign} label="Funding" value={s.amount ?? FUNDING_LABELS[s.fundingType]} />
              <Fact icon={Globe} label="Country" value={s.country} />
              {s.intake && <Fact icon={CalendarClock} label="Intake" value={s.intake} />}
              {s.opensAt && <Fact icon={CalendarClock} label="Opens" value={formatDate(s.opensAt)} />}
              <Fact icon={CalendarClock} label="Deadline" value={formatDate(s.deadline) ?? "Rolling"} />
            </dl>
          </div>

          {requirements.length > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="text-base font-bold text-slate-900">What you&apos;ll need</h3>
              <p className="mt-1 text-xs text-slate-500">Your Document Vault will track each of these for you.</p>
              <ul className="mt-4 space-y-2.5">
                {requirements.map((r) => (
                  <li key={`${r.kind}-${r.label}`} className="flex items-start gap-3 text-sm text-slate-700">
                    <span
                      className={
                        r.kind === "certificate"
                          ? "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-brand-orange-dark"
                          : "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue"
                      }
                    >
                      {r.kind === "certificate" ? <Award className="size-3.5" /> : <FileText className="size-3.5" />}
                    </span>
                    <span>
                      {r.label}
                      {r.kind === "certificate" && <span className="ml-1.5 text-xs font-medium text-brand-orange-dark">Certificate</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7">
      <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function CheckList({ items, tone }: { items: string[]; tone: "blue" | "green" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
          <CircleCheck className={tone === "green" ? "mt-0.5 size-[18px] shrink-0 text-emerald-500" : "mt-0.5 size-[18px] shrink-0 text-brand-blue"} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="flex items-center gap-2 text-slate-500">
        <Icon className="size-4 text-slate-400" />
        {label}
      </dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
