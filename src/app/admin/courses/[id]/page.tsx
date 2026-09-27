import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Eye, Pencil } from "lucide-react";
import { getCourseForAdmin } from "@/lib/courses";
import { COURSE_CATEGORIES, formatPrice } from "@/lib/learning-rules";
import { SavedToast } from "../../scholarships/saved-toast";
import { LearnersPanel, LessonsManager } from "./course-manager";

export const metadata: Metadata = {
  title: "Course | Back office",
};

export default async function AdminCoursePage({ params, searchParams }: PageProps<"/admin/courses/[id]">) {
  const { id } = await params;
  const { saved } = await searchParams;
  const data = await getCourseForAdmin(id);
  if (!data) notFound();
  const { course: c, lessons, learners } = data;

  return (
    <div className="space-y-6">
      <SavedToast title={saved ? c.title : undefined} label="Course saved" />
      <Link href="/admin/courses" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Courses
      </Link>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {COURSE_CATEGORIES[c.category]} · {formatPrice(c.priceCents, c.currency)} · {c.status}
          </p>
          <h2 className="mt-1 truncate text-2xl font-bold text-slate-900">{c.title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{c.subtitle}</p>
          {c.awardsCertificate && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange-dark">
              <Award className="size-3.5" /> Awards: {c.certificateName ?? `${c.title} Certificate`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {c.status === "published" && (
            <Link href={`/dashboard/courses/${c.slug}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Eye className="size-4" /> View as student
            </Link>
          )}
          <Link href={`/admin/courses/${c.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42]">
            <Pencil className="size-4" /> Edit details
          </Link>
        </div>
      </section>

      <div className="grid gap-6 2xl:grid-cols-2">
        <LessonsManager courseId={c.id} lessons={lessons} />
        <LearnersPanel courseId={c.id} learners={learners} lessonCount={lessons.length} />
      </div>
    </div>
  );
}
