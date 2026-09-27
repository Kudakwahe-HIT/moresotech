import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCourseForAdmin, listInstructors } from "@/lib/courses";
import { updateCourse } from "../../actions";
import { CourseForm } from "../../course-form";

export const metadata: Metadata = {
  title: "Edit course | Back office",
};

export default async function EditCoursePage({ params }: PageProps<"/admin/courses/[id]/edit">) {
  const { id } = await params;
  const [data, instructors] = await Promise.all([getCourseForAdmin(id), listInstructors()]);
  if (!data) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href={`/admin/courses/${id}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> {data.course.title}
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Edit course details</h2>
      </div>
      <CourseForm action={updateCourse.bind(null, id)} initial={data.course} instructors={instructors} />
    </div>
  );
}
