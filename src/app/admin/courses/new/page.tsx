import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listInstructors } from "@/lib/courses";
import { createCourse } from "../actions";
import { CourseForm } from "../course-form";

export const metadata: Metadata = {
  title: "New course | Back office",
};

export default async function NewCoursePage() {
  const instructors = await listInstructors();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/courses" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Courses
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">New course</h2>
        <p className="mt-1 text-sm text-slate-500">You&apos;ll add lessons on the next screen.</p>
      </div>
      <CourseForm action={createCourse} instructors={instructors} />
    </div>
  );
}
