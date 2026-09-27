import type { EnrollmentStatus } from "@/db/schema";

// Plain data and pure functions: safe to import from client and server components.

export const COURSE_CATEGORIES: Record<string, string> = {
  language: "Korean language",
  test_prep: "Test prep",
  documents: "Documents & visas",
  interview: "Interview & essays",
  other: "Other",
};

export const ENROLLMENT_STATUS: Record<EnrollmentStatus, { label: string; tone: string }> = {
  pending_payment: { label: "Awaiting payment", tone: "bg-amber-50 text-amber-700" },
  active: { label: "Enrolled", tone: "bg-brand-blue/10 text-brand-blue" },
  completed: { label: "Completed", tone: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelled", tone: "bg-slate-100 text-slate-500" },
};

export function formatPrice(cents: number, currency = "USD") {
  if (cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

export function hasCourseAccess(status: EnrollmentStatus | null | undefined) {
  return status === "active" || status === "completed";
}

/** Turns a YouTube / Vimeo link into an embeddable URL. Anything else is shown as a plain link. */
export function videoEmbed(url: string | null): { kind: "embed"; src: string } | { kind: "link"; src: string } | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? (u.pathname.startsWith("/embed/") ? u.pathname.split("/")[2] : null);
      if (id) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
    }
    if (host === "youtu.be") return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(u.pathname.slice(1))}` };
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return { kind: "embed", src: `https://player.vimeo.com/video/${id}` };
    }
    if (u.protocol === "https:" || u.protocol === "http:") return { kind: "link", src: url };
  } catch {
    // not a URL
  }
  return null;
}

/** Join opens 15 minutes before the start and stays open until 30 minutes after the scheduled end. */
export const JOIN_OPENS_MIN_BEFORE = 15;
const JOIN_CLOSES_MIN_AFTER_END = 30;

export function webinarWindow(startsAt: Date, durationMinutes: number, now = new Date()) {
  const start = startsAt.getTime();
  const end = start + durationMinutes * 60_000;
  const t = now.getTime();
  return {
    canJoin: t >= start - JOIN_OPENS_MIN_BEFORE * 60_000 && t <= end + JOIN_CLOSES_MIN_AFTER_END * 60_000,
    live: t >= start && t <= end,
    past: t > end,
  };
}

export function formatDuration(minutes: number | null) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
