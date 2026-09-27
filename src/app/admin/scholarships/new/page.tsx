import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createScholarship } from "../actions";
import { ScholarshipForm } from "../scholarship-form";

export const metadata: Metadata = {
  title: "New scholarship | Back office",
};

export default function NewScholarshipPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link href="/admin/scholarships" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Scholarships
        </Link>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">New scholarship</h2>
        <p className="mt-1 text-sm text-slate-500">It stays a draft until you publish it, so you can save your progress.</p>
      </div>
      <ScholarshipForm action={createScholarship} />
    </div>
  );
}
