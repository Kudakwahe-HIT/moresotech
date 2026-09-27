import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Award, BadgeCheck, BookOpen, GraduationCap, ListVideo } from "lucide-react";
import { ProgressRing } from "@/components/applications/progress-ring";
import { requireRole } from "@/lib/auth";
import { listCoursesForStudent, listStudentCertificates } from "@/lib/courses";
import { COURSE_CATEGORIES, ENROLLMENT_STATUS, formatPrice, hasCourseAccess } from "@/lib/learning-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Courses & certificates | MoreSo Tech",
};

const TABS = [
  { key: "all", label: "All courses" },
  { key: "mine", label: "My learning" },
  { key: "certificates", label: "Certificates" },
] as const;

const CATEGORY_TONES: Record<string, string> = {
  language: "from-brand-blue to-[#1f7ac4]",
  test_prep: "from-brand-orange to-[#f7a24f]",
  documents: "from-emerald-600 to-emerald-400",
  interview: "from-violet-600 to-violet-400",
  other: "from-slate-700 to-slate-500",
};

export default async function CoursesPage({ searchParams }: PageProps<"/dashboard/courses">) {
  const profile = await requireRole("student");
  const params = await searchParams;
  const tab = TABS.find((t) => t.key === params.tab)?.key ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Courses & certificates</h2>
          <p className="mt-1 text-sm text-slate-500">Build the language skills and certificates scholarships ask for.</p>
        </div>
        <nav aria-label="Course views" className="flex w-fit rounded-2xl bg-white p-1 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.key === "all" ? "/dashboard/courses" : `/dashboard/courses?tab=${t.key}`}
              aria-current={tab === t.key ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition",
                tab === t.key ? "bg-[#0f1b2d] text-white" : "text-slate-500 hover:text-slate-900",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {tab === "certificates" ? <Certificates profileId={profile.id} /> : <CourseGrid profileId={profile.id} view={tab} />}
    </div>
  );
}

async function CourseGrid({ profileId, view }: { profileId: string; view: "all" | "mine" }) {
  const rows = await listCoursesForStudent(profileId, view);
  if (!rows.length) {
    return (
      <Empty
        icon={<BookOpen className="size-7" />}
        title={view === "mine" ? "You haven't enrolled in a course yet" : "Courses are coming soon"}
        body={view === "mine" ? "Browse all courses and enroll to start learning." : "Our instructors are preparing the first courses. Check back soon."}
        action={view === "mine" ? { href: "/dashboard/courses", label: "Browse courses" } : undefined}
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(({ course: c, lessonCount, enrollmentStatus, completedCount, instructorFirst, instructorLast }) => {
        const access = hasCourseAccess(enrollmentStatus);
        const percent = lessonCount ? Math.round((completedCount / lessonCount) * 100) : 0;
        const instructor = [instructorFirst, instructorLast].filter(Boolean).join(" ");
        return (
          <Link
            key={c.id}
            href={`/dashboard/courses/${c.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] hover:ring-slate-200"
          >
            <div className={cn("relative flex h-28 items-end bg-gradient-to-br p-4", CATEGORY_TONES[c.category] ?? CATEGORY_TONES.other)}>
              <GraduationCap aria-hidden className="absolute right-4 top-4 size-14 text-white/20" />
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                {COURSE_CATEGORIES[c.category] ?? "Course"}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-bold leading-snug text-slate-900">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ListVideo className="size-3.5" /> {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                </span>
                {c.awardsCertificate && (
                  <span className="inline-flex items-center gap-1 text-brand-orange-dark">
                    <Award className="size-3.5" /> Certificate
                  </span>
                )}
                {instructor && <span>by {instructor}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                {access ? (
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ProgressRing percent={percent} size={36} stroke={4} className="[&_span]:text-[0.6rem]" />
                    {enrollmentStatus === "completed" ? "Completed" : "Continue"}
                  </span>
                ) : enrollmentStatus === "pending_payment" ? (
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", ENROLLMENT_STATUS.pending_payment.tone)}>Awaiting payment</span>
                ) : (
                  <span className="text-lg font-bold text-slate-900">{formatPrice(c.priceCents, c.currency)}</span>
                )}
                <span className="text-sm font-semibold text-brand-blue group-hover:underline">View course</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function Certificates({ profileId }: { profileId: string }) {
  const rows = await listStudentCertificates(profileId);
  if (!rows.length) {
    return (
      <Empty
        icon={<Award className="size-7" />}
        title="No certificates yet"
        body="Complete every lesson in a certificate course and your certificate appears here, ready to share."
        action={{ href: "/dashboard/courses", label: "Browse courses" }}
      />
    );
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {rows.map(({ certificate: c }) => (
        <Link
          key={c.id}
          href={`/dashboard/certificates/${c.code}`}
          className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-[#f7a24f] text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.7)]">
            <Award className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900">{c.certificateName}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Issued {c.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <BadgeCheck className="size-3.5" /> Verification code {c.code}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">{icon}</div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{body}</p>
      {action && (
        <Link href={action.href} className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white transition hover:bg-brand-orange-dark">
          {action.label}
        </Link>
      )}
    </div>
  );
}
