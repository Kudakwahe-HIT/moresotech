import type { Metadata } from "next";
import Link from "next/link";
import { Award, Eye, FileText, FolderLock, KeyRound, ScrollText, ShieldCheck } from "lucide-react";
import { DocumentStatusBadge, VerifiedStamp } from "@/components/applications/badges";
import { requireRole } from "@/lib/auth";
import { formatBytes, formatDateTime } from "@/lib/application-rules";
import { listStudentDocuments } from "@/lib/applications";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Document Vault | MoreSo Tech",
};

export default async function DocumentVaultPage() {
  const profile = await requireRole("student", "instructor", "admin");
  const rows = await listStudentDocuments(profile.id);
  const verified = rows.filter((r) => r.document.status === "verified").length;

  // Group by application so students see each scholarship's paperwork together.
  const groups = new Map<string, { title: string; applicationId: string; docs: typeof rows }>();
  for (const row of rows) {
    const g = groups.get(row.applicationId) ?? { title: row.scholarshipTitle, applicationId: row.applicationId, docs: [] };
    g.docs.push(row);
    groups.set(row.applicationId, g);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Document Vault</h2>
          <p className="mt-1 text-sm text-slate-500">Every file you&apos;ve uploaded, and its review status.</p>
        </div>
        {rows.length > 0 && (
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-emerald-600">{verified}</span> of {rows.length} verified
          </p>
        )}
      </div>

      {/* Why students can trust us with their passport */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: KeyRound, title: "Private by default", body: "Files are stored privately and never have a public link." },
          { icon: ShieldCheck, title: "Staff-only access", body: "Only you and authorised MoreSo Tech reviewers can open them." },
          { icon: ScrollText, title: "Every view is logged", body: "We record each time a reviewer opens one of your files." },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <item.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.body}</p>
            </div>
          </div>
        ))}
      </div>

      {groups.size ? (
        [...groups.values()].map((group) => (
          <section key={group.applicationId} className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-5">
              <h3 className="truncate font-bold text-slate-900">{group.title}</h3>
              <Link href={`/dashboard/applications/${group.applicationId}`} className="shrink-0 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark">
                Open application
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {group.docs.map(({ document: d }) => (
                <li key={d.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3.5">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        d.kind === "certificate" ? "bg-brand-orange/10 text-brand-orange-dark" : "bg-brand-blue/10 text-brand-blue",
                      )}
                    >
                      {d.kind === "certificate" ? <Award className="size-[18px]" /> : <FileText className="size-[18px]" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{d.requirement}</p>
                      <p className="truncate text-xs text-slate-500">
                        {d.fileName} · {formatBytes(d.sizeBytes)} · {formatDateTime(d.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 pl-[3.375rem] sm:pl-0">
                    {d.status === "verified" ? <VerifiedStamp /> : <DocumentStatusBadge status={d.status} />}
                    <a
                      href={`/api/documents/${d.id}`}
                      target="_blank"
                      rel="noopener"
                      aria-label={`View ${d.requirement}`}
                      className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Eye className="size-4" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue ring-8 ring-brand-blue/[0.04]">
            <FolderLock className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">Your vault is empty</h3>
          <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
            Documents you upload for your applications will be kept here, safely.
          </p>
        </div>
      )}
    </div>
  );
}
