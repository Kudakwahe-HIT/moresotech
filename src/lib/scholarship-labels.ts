import type { FundingType, ScholarshipLevel, ScholarshipStatus } from "@/db/schema";

// Plain data, safe to import from client and server components alike.

export const LEVEL_LABELS: Record<ScholarshipLevel, string> = {
  language: "Language program",
  undergraduate: "Undergraduate",
  masters: "Master's",
  phd: "PhD",
  research: "Research",
};

export const FUNDING_LABELS: Record<FundingType, string> = {
  full: "Fully funded",
  partial: "Partially funded",
  tuition: "Tuition only",
  stipend: "Stipend",
};

export const STATUS_LABELS: Record<ScholarshipStatus, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
};

export type DeadlineInfo = {
  label: string;
  /** For colour: closed (past), urgent (≤7 days), soon (≤30 days), open, or none. */
  tone: "closed" | "urgent" | "soon" | "open" | "none";
  daysLeft: number | null;
};

/** Countdown text for a YYYY-MM-DD deadline, measured in whole days (UTC). */
export function deadlineInfo(deadline: string | null): DeadlineInfo {
  if (!deadline) return { label: "Rolling deadline", tone: "none", daysLeft: null };
  const today = new Date();
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const [y, m, d] = deadline.split("-").map(Number);
  const daysLeft = Math.round((Date.UTC(y, m - 1, d) - start) / 86_400_000);
  if (daysLeft < 0) return { label: "Closed", tone: "closed", daysLeft };
  if (daysLeft === 0) return { label: "Closes today", tone: "urgent", daysLeft };
  if (daysLeft === 1) return { label: "1 day left", tone: "urgent", daysLeft };
  if (daysLeft <= 7) return { label: `${daysLeft} days left`, tone: "urgent", daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft} days left`, tone: "soon", daysLeft };
  return { label: `${daysLeft} days left`, tone: "open", daysLeft };
}

export function formatDate(date: string | null, style: "long" | "short" = "long") {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
