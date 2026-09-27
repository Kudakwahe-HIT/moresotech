import type { Metadata } from "next";
import Link from "next/link";
import { Award, BookOpen, Plus } from "lucide-react";
import type { CourseStatus } from "@/db/schema";
import { listCoursesForAdmin } from "@/lib/courses";
import { COURSE_CATEGORIES, formatPrice } from "@/lib/learning-rules";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Courses | Back office",
};

const STATUS: Record<CourseStatus, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-slate-100 text-slate-600" },
  published: { label: "Published", tone: "bg-emerald-50 text-emerald-700" },
  archived: { label: "Archived", tone: "bg-red-50 text-red-600" },
};

export default async function AdminCoursesPage() {
  const rows = await listCoursesForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Courses & certificates</h2>
          <p className="mt-1 text-sm text-slate-500">Create courses, add lessons and manage learners.</p>
        </div>
        <Link href="/admin/courses/new" className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-auto">
          <Plus className="size-4" /> New course
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {rows.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="w-full px-6 py-3.5 font-semibold">Course</th>
                <th className="hidden px-4 py-3.5 font-semibold md:table-cell">Price</th>
                <th className="hidden px-4 py-3.5 font-semibold lg:table-cell">Learners</th>
                <th className="px-4 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(({ course: c, lessonCount, learners, pending, instructorFirst, instructorLast }) => (
                <tr key={c.id} className="relative transition-colors hover:bg-slate-50/60">
                  <td className="max-w-0 px-6 py-4">
                    <Link href={`/admin/courses/${c.id}`} className="flex items-center gap-2 font-semibold text-slate-900 after:absolute after:inset-0 hover:text-brand-blue">
                      <span className="truncate">{c.title}</span>
                      {c.awardsCertificate && <Award aria-label="Awards a certificate" className="size-3.5 shrink-0 text-brand-orange" />}
                    </Link>
                    <p className="truncate text-xs text-slate-500">
                      {COURSE_CATEGORIES[c.category]} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                      {instructorFirst ? ` · ${[instructorFirst, instructorLast].filter(Boolean).join(" ")}` : ""}
                    </p>
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-4 font-semibold text-slate-800 md:table-cell">{formatPrice(c.priceCents, c.currency)}</td>
                  <td className="hidden whitespace-nowrap px-4 py-4 lg:table-cell">
                    <span className="font-semibold text-slate-800">{learners}</span>
                    {pending > 0 && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{pending} to confirm</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STATUS[c.status].tone)}>{STATUS[c.status].label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
              <BookOpen className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No courses yet</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Create a course, add its lessons, then publish it for students.</p>
          </div>
        )}
      </div>
    </div>
  );
}
