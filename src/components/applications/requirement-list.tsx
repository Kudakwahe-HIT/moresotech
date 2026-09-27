import type { ReactNode } from "react";
import { Award, Eye, FileText, MessageSquareWarning } from "lucide-react";
import { formatBytes, formatDateTime, type RequirementProgress } from "@/lib/application-rules";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge, VerifiedStamp } from "./badges";

/**
 * Checklist of what the scholarship needs, with the current upload for each.
 * `renderActions` lets the student page add Upload/Replace and the admin page add review buttons.
 */
export function RequirementList({
  items,
  renderActions,
}: {
  items: RequirementProgress[];
  renderActions?: (item: RequirementProgress, index: number) => ReactNode;
}) {
  if (!items.length) {
    return <p className="px-6 pb-6 text-sm text-slate-500">This scholarship doesn&apos;t list any required documents.</p>;
  }

  return (
    <ul className="@container divide-y divide-slate-100">
      {items.map((item, index) => {
        const doc = item.document;
        return (
          <li key={`${item.kind}-${item.label}`} className="flex flex-col gap-4 px-6 py-5 @2xl:flex-row @2xl:items-center">
            <div className="flex min-w-0 flex-1 gap-4">
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                  item.kind === "certificate" ? "bg-brand-orange/10 text-brand-orange-dark" : "bg-brand-blue/10 text-brand-blue",
                )}
              >
                {item.kind === "certificate" ? <Award className="size-5" /> : <FileText className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  {item.kind === "certificate" && (
                    <span className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-orange-dark">Certificate</span>
                  )}
                </div>

                {doc ? (
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex max-w-[16rem] items-center gap-1 truncate font-medium text-brand-blue hover:underline"
                    >
                      <Eye className="size-3.5 shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </a>
                    <span>· {formatBytes(doc.sizeBytes)}</span>
                    <span>· uploaded {formatDateTime(doc.uploadedAt)}</span>
                    {item.versions > 1 && <span>· version {item.versions}</span>}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">Not uploaded yet</p>
                )}

                {item.status === "needs_revision" && doc?.reviewNote && (
                  <p className="mt-2.5 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-700">
                    <MessageSquareWarning className="mt-px size-3.5 shrink-0" />
                    <span>
                      <span className="font-semibold">Reviewer: </span>
                      {doc.reviewNote}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pl-15 @2xl:pl-0">
              {item.status === "verified" ? <VerifiedStamp /> : <DocumentStatusBadge status={item.status} />}
              {renderActions?.(item, index)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
