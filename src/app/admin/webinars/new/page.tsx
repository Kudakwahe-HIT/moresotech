import type { Metadata } from "next";
import Link from "next/link";
import { asc, ne } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { courses } from "@/db/schema";
import { db } from "@/lib/db";
import { createWebinar } from "../actions";
import { WebinarForm } from "../webinar-form";

export const metadata: Metadata = {
  title: "Schedule webinar | Back office",
};

export default async function NewWebinarPage() {
  const courseList = await db.select({ id: courses.id, title: courses.title }).from(courses).where(ne(courses.status, "archived")).orderBy(asc(courses.title));
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/webinars" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Webinars
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Schedule a webinar</h2>
      </div>
      <WebinarForm action={createWebinar} courses={courseList} />
    </div>
  );
}
