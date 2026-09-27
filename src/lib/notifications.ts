import "server-only";
import type { User } from "@clerk/nextjs/server";
import { listStudentApplications } from "@/lib/applications";

export type NotificationKind =
  | "welcome"
  | "verify-email"
  | "add-photo"
  | "first-application"
  | "revision"
  | "changes"
  | "ready"
  | "in-review"
  | "approved"
  | "rejected";

export type AppNotification = {
  /** Unique key. */
  id: string;
  /** Decides the icon and colour. */
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  cta: string;
  /** Needs the user to do something; these count towards the bell badge. */
  actionRequired: boolean;
  /** Pre-formatted on the server, e.g. "3 days ago", so server and client render the same text. */
  time: string;
};

/**
 * Built from real data: the user's applications (revisions, decisions, ready-to-submit) plus
 * onboarding reminders. Action items come first. Emails for these arrive in a later phase.
 */
export async function getNotifications(user: User, profileId: string): Promise<AppNotification[]> {
  const applications = await listStudentApplications(profileId);
  const items: AppNotification[] = [];

  for (const { application: app, scholarship: s, progress } of applications) {
    const href = `/dashboard/applications/${app.id}`;
    const time = relativeTime(app.updatedAt.getTime());

    if (app.status === "approved") {
      items.push({ id: `approved-${app.id}`, kind: "approved", title: "Application approved 🎉", body: `${s.title}: ${app.reviewerNote ?? "Congratulations! We'll contact you with next steps."}`, href, cta: "View application", actionRequired: false, time });
    } else if (app.status === "rejected") {
      items.push({ id: `rejected-${app.id}`, kind: "rejected", title: "Application update", body: `${s.title} wasn't successful this time.`, href, cta: "See feedback", actionRequired: false, time });
    } else if (app.status === "changes_requested") {
      items.push({ id: `changes-${app.id}`, kind: "changes", title: "Changes requested", body: `${s.title}: ${app.reviewerNote ?? "Your reviewer asked for changes."}`, href, cta: "Fix and resubmit", actionRequired: true, time });
    } else if (app.status === "submitted" || app.status === "under_review") {
      items.push({ id: `review-${app.id}`, kind: "in-review", title: app.status === "submitted" ? "Application submitted" : "Your application is being assessed", body: s.title, href, cta: "View application", actionRequired: false, time });
    } else if (app.status === "draft") {
      if (progress.needsRevision) {
        items.push({ id: `revision-${app.id}`, kind: "revision", title: progress.needsRevision === 1 ? "1 document needs revision" : `${progress.needsRevision} documents need revision`, body: `${s.title}: read the reviewer's note and upload a corrected file.`, href, cta: "Re-upload", actionRequired: true, time });
      } else if (progress.allVerified && progress.total > 0) {
        items.push({ id: `ready-${app.id}`, kind: "ready", title: "Ready to submit", body: `Everything for ${s.title} is verified. Submit it for assessment.`, href, cta: "Submit now", actionRequired: true, time });
      }
    }
  }

  const joined = relativeTime(user.createdAt);
  if (user.primaryEmailAddress?.verification?.status !== "verified") {
    items.push({ id: "verify-email", kind: "verify-email", title: "Verify your email address", body: "Confirm your email so you can recover your account and receive application updates.", href: "/dashboard/profile", cta: "Verify email", actionRequired: true, time: joined });
  }
  if (!user.hasImage) {
    items.push({ id: "add-photo", kind: "add-photo", title: "Add a profile photo", body: "Help reviewers recognise you by adding a photo to your profile.", href: "/dashboard/profile", cta: "Add photo", actionRequired: true, time: joined });
  }
  if (!applications.length) {
    items.push({ id: "first-application", kind: "first-application", title: "Start your first application", body: "Browse current scholarships and start an application. We'll guide you through every document.", href: "/dashboard/scholarships", cta: "Browse scholarships", actionRequired: true, time: joined });
  }
  items.push({ id: "welcome", kind: "welcome", title: "Welcome to MoreSo Tech!", body: "Your account is ready. Uplift, equip and become through innovative learning.", href: "/dashboard", cta: "Open dashboard", actionRequired: false, time: joined });

  // Things to do first, then updates.
  return [...items.filter((n) => n.actionRequired), ...items.filter((n) => !n.actionRequired)];
}

function relativeTime(timestamp: number): string {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return "just now";
}
