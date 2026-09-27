import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getScholarshipById } from "@/lib/scholarships";
import { updateScholarship } from "../../actions";
import { ScholarshipForm } from "../../scholarship-form";

export const metadata: Metadata = {
  title: "Edit scholarship | Back office",
};

export default async function EditScholarshipPage({ params }: PageProps<"/admin/scholarships/[id]/edit">) {
  const { id } = await params;
  const scholarship = await getScholarshipById(id);
  if (!scholarship) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/scholarships" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Scholarships
        </Link>
        <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">{scholarship.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Changes go live for students as soon as you save.</p>
          </div>
        </div>
      </div>
      {/* Bind the id so the form action has the (prev, formData) shape useActionState expects. */}
      <ScholarshipForm action={updateScholarship.bind(null, scholarship.id)} initial={scholarship} />
    </div>
  );
}
