import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { WebinarForm } from "@/app/admin/webinars/webinar-form";
import { requireRole } from "@/lib/auth";
import { listTaughtCourses } from "@/lib/webinars";
import { createTeachWebinar } from "../actions";

export const metadata: Metadata = {
  title: "Schedule session | Teaching",
};

export default async function NewTeachWebinarPage() {
  const profile = await requireRole("instructor", "admin");
  const [taught, user] = await Promise.all([listTaughtCourses(profile.id), currentUser()]);
  if (!taught.length) redirect("/teach/webinars");
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/teach/webinars" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Sessions
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Schedule a session</h2>
      </div>
      <WebinarForm action={createTeachWebinar} courses={taught} mode="instructor" cancelHref="/teach/webinars" defaultHost={user?.fullName ?? undefined} />
    </div>
  );
}
