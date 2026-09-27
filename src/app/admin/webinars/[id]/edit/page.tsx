import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, ne } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { courses } from "@/db/schema";
import { db } from "@/lib/db";
import { getWebinarById } from "@/lib/webinars";
import { updateWebinar } from "../../actions";
import { WebinarForm } from "../../webinar-form";

export const metadata: Metadata = {
  title: "Edit webinar | Back office",
};

export default async function EditWebinarPage({ params }: PageProps<"/admin/webinars/[id]/edit">) {
  const { id } = await params;
  const [webinar, courseList] = await Promise.all([
    getWebinarById(id),
    db.select({ id: courses.id, title: courses.title }).from(courses).where(ne(courses.status, "archived")).orderBy(asc(courses.title)),
  ]);
  if (!webinar) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/webinars" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Webinars
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Edit webinar</h2>
      </div>
      <WebinarForm action={updateWebinar.bind(null, id)} initial={webinar} courses={courseList} />
    </div>
  );
}
