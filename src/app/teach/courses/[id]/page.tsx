import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { getCourseForInstructor } from "@/lib/courses";
import { COURSE_CATEGORIES, formatPrice } from "@/lib/learning-rules";
import { LearnersPanel, LessonsManager } from "@/app/admin/courses/[id]/course-manager";
import { CourseContentForm } from "./content-form";

export const metadata: Metadata = {
  title: "Course | Teaching",
};

export default async function TeachCoursePage({ params }: PageProps<"/teach/courses/[id]">) {
  const { id } = await params;
  const profile = await requireRole("instructor", "admin");
  // Same 404 for "doesn't exist" and "not yours".
  const data = await getCourseForInstructor(id, profile);
  if (!data) notFound();
  const { course: c, lessons, learners } = data;

  return (
    <div className="space-y-6">
      <Link href="/teach/courses" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> My courses
      </Link>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {COURSE_CATEGORIES[c.category]} · {formatPrice(c.priceCents, c.currency)} · {c.status}
          </p>
          <h2 className="mt-1 truncate text-2xl font-bold text-slate-900">{c.title}</h2>
          {c.awardsCertificate && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange-dark">
              <Award className="size-3.5" /> Awards: {c.certificateName ?? `${c.title} Certificate`}
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-2">
        <LessonsManager courseId={c.id} lessons={lessons} />
        <CourseContentForm course={c} />
      </div>
      <LearnersPanel courseId={c.id} learners={learners} lessonCount={lessons.length} readOnly />
    </div>
  );
}
