import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { WebinarForm } from "@/app/admin/webinars/webinar-form";
import { requireRole } from "@/lib/auth";
import { getWebinarById, listTaughtCourses } from "@/lib/webinars";
import { updateTeachWebinar } from "../../actions";

export const metadata: Metadata = {
  title: "Edit session | Teaching",
};

export default async function EditTeachWebinarPage({ params }: PageProps<"/teach/webinars/[id]/edit">) {
  const { id } = await params;
  const profile = await requireRole("instructor", "admin");
  const [webinar, taught] = await Promise.all([getWebinarById(id), listTaughtCourses(profile.id)]);
  // Only sessions for a course this instructor teaches.
  if (!webinar || !taught.some((c) => c.id === webinar.courseId)) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/teach/webinars" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Sessions
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Edit session</h2>
      </div>
      <WebinarForm action={updateTeachWebinar.bind(null, id)} initial={webinar} courses={taught} mode="instructor" cancelHref="/teach/webinars" />
    </div>
  );
}
