import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, ListVideo, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { listCoursesForInstructor } from "@/lib/courses";
import { COURSE_CATEGORIES } from "@/lib/learning-rules";
import { CourseCover } from "@/components/learning/course-cover";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My courses | Teaching",
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-50 text-emerald-700",
};

export default async function TeachCoursesPage() {
  const profile = await requireRole("instructor", "admin");
  const rows = await listCoursesForInstructor(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">My courses</h2>
        <p className="mt-1 text-sm text-slate-500">Courses an admin has assigned to you. You can edit their content and lessons.</p>
      </div>

      {rows.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ course: c, lessonCount, learners, completed }) => (
            <Link
              key={c.id}
              href={`/teach/courses/${c.id}`}
              className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(15,23,42,0.18)] hover:ring-slate-200"
            >
              <CourseCover course={c} className="aspect-[16/9]" />
              <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{COURSE_CATEGORIES[c.category]}</span>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_TONE[c.status] ?? STATUS_TONE.draft)}>{c.status}</span>
              </div>
              <h3 className="mt-3 font-bold leading-snug text-slate-900">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.subtitle}</p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <ListVideo className="size-3.5" /> {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5" /> {learners} learners
                </span>
                <span className="inline-flex items-center gap-1">
                  <Award className="size-3.5" /> {completed} completed
                </span>
              </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
            <BookOpen className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No courses assigned yet</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">When an admin assigns you as a course&apos;s instructor, it will appear here.</p>
        </div>
      )}
    </div>
  );
}
