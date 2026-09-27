import type { ApplicationDocument, ApplicationStatus, DocumentStatus, Requirement } from "@/db/schema";

// Plain data and pure functions: safe to import from client and server components.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export const ALLOWED_UPLOAD_LABEL = "PDF, JPG, PNG or WEBP, up to 10 MB";

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: string }> = {
  draft: { label: "In progress", tone: "bg-brand-blue/10 text-brand-blue" },
  submitted: { label: "Submitted", tone: "bg-violet-50 text-violet-700" },
  under_review: { label: "Under review", tone: "bg-amber-50 text-amber-700" },
  changes_requested: { label: "Changes requested", tone: "bg-brand-orange/10 text-brand-orange-dark" },
  approved: { label: "Approved", tone: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Not successful", tone: "bg-red-50 text-red-600" },
  withdrawn: { label: "Withdrawn", tone: "bg-slate-100 text-slate-500" },
};

export const DOCUMENT_STATUS: Record<DocumentStatus | "missing", { label: string; tone: string }> = {
  missing: { label: "Not uploaded", tone: "bg-slate-100 text-slate-500" },
  pending: { label: "Awaiting review", tone: "bg-amber-50 text-amber-700" },
  verified: { label: "Verified", tone: "bg-emerald-50 text-emerald-700" },
  needs_revision: { label: "Needs revision", tone: "bg-red-50 text-red-600" },
};

/** Students can upload and replace files only while the application is with them. */
export function canStudentEdit(status: ApplicationStatus) {
  return status === "draft" || status === "changes_requested";
}

export type RequirementProgress = Requirement & {
  /** The current (non-superseded) upload, if any. */
  document: ApplicationDocument | null;
  status: DocumentStatus | "missing";
  versions: number;
};

export type ApplicationProgress = {
  items: RequirementProgress[];
  total: number;
  uploaded: number;
  verified: number;
  needsRevision: number;
  pending: number;
  /** Share of requirements verified by the MoreSo Tech team (0–100). This is completeness, not a prediction. */
  percent: number;
  allVerified: boolean;
};

export function computeProgress(requirements: Requirement[], documents: ApplicationDocument[]): ApplicationProgress {
  const items = requirements.map((req) => {
    const forReq = documents.filter((d) => d.requirement === req.label && d.kind === req.kind);
    const current = forReq.find((d) => !d.supersededAt) ?? null;
    return { ...req, document: current, status: current?.status ?? ("missing" as const), versions: forReq.length };
  });
  const total = items.length;
  const verified = items.filter((i) => i.status === "verified").length;
  return {
    items,
    total,
    uploaded: items.filter((i) => i.status !== "missing").length,
    verified,
    needsRevision: items.filter((i) => i.status === "needs_revision").length,
    pending: items.filter((i) => i.status === "pending").length,
    percent: total === 0 ? 100 : Math.round((verified / total) * 100),
    allVerified: verified === total,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
