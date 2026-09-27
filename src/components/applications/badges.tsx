import { CircleAlert, CircleCheck, Clock, FileQuestion, ShieldCheck } from "lucide-react";
import type { ApplicationStatus, DocumentStatus } from "@/db/schema";
import { APPLICATION_STATUS, DOCUMENT_STATUS } from "@/lib/application-rules";
import { cn } from "@/lib/utils";

export function ApplicationStatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  const s = APPLICATION_STATUS[status];
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", s.tone, className)}>
      {s.label}
    </span>
  );
}

const DOC_ICONS = { missing: FileQuestion, pending: Clock, verified: CircleCheck, needs_revision: CircleAlert };

export function DocumentStatusBadge({ status }: { status: DocumentStatus | "missing" }) {
  const s = DOCUMENT_STATUS[status];
  const Icon = DOC_ICONS[status];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold", s.tone)}>
      <Icon className="size-3.5" />
      {s.label}
    </span>
  );
}

/** Official-looking stamp shown on verified documents. */
export function VerifiedStamp() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-emerald-700">
      <ShieldCheck className="size-3.5" />
      Verified by MoreSo Tech
    </span>
  );
}
