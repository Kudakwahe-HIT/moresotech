import type { User } from "@clerk/nextjs/server";

export type NotificationKind = "welcome" | "verify-email" | "add-photo" | "first-course";

export type AppNotification = {
  id: NotificationKind;
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
 * There's no notifications backend yet, so these come straight from the user's real account state:
 * a welcome message plus a reminder for each onboarding step that isn't done.
 */
export function getNotifications(user: User): AppNotification[] {
  const joined = relativeTime(user.createdAt);
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";

  const items: AppNotification[] = [];
  if (!emailVerified) {
    items.push({
      id: "verify-email",
      title: "Verify your email address",
      body: "Confirm your email so you can recover your account and receive course updates.",
      href: "/dashboard/profile",
      cta: "Verify email",
      actionRequired: true,
      time: joined,
    });
  }
  if (!user.hasImage) {
    items.push({
      id: "add-photo",
      title: "Add a profile photo",
      body: "Help instructors and classmates recognise you by adding a photo to your profile.",
      href: "/dashboard/profile",
      cta: "Add photo",
      actionRequired: true,
      time: joined,
    });
  }
  items.push({
    id: "first-course",
    title: "Enroll in your first course",
    body: "Courses are on their way. You'll be able to browse and enroll from My Courses.",
    href: "/dashboard/courses",
    cta: "Go to My Courses",
    actionRequired: true,
    time: joined,
  });
  items.push({
    id: "welcome",
    title: "Welcome to MoreSo Tech!",
    body: "Your account is ready. Uplift, equip and become through innovative learning.",
    href: "/dashboard",
    cta: "Open dashboard",
    actionRequired: false,
    time: joined,
  });
  return items;
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
