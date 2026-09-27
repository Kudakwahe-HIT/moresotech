import type { NotificationKind } from "@/lib/notifications";

// Plain data, safe to import from client and server components alike.

export const KOREAN_LEVELS: Record<string, string> = {
  none: "No Korean yet",
  beginner: "Beginner (no TOPIK yet)",
  topik1: "TOPIK 1",
  topik2: "TOPIK 2",
  topik3: "TOPIK 3",
  topik4: "TOPIK 4",
  topik5: "TOPIK 5",
  topik6: "TOPIK 6",
};

/** Notification groups a student may switch off. Anything that needs them to act is always shown. */
export const MUTABLE_NOTIFICATION_GROUPS = {
  progress: {
    label: "Application progress",
    description: "When an application is submitted, being assessed, approved or not successful.",
    kinds: ["in-review", "approved", "rejected"],
  },
  tips: {
    label: "Tips & reminders",
    description: "Getting-started suggestions, like adding a profile photo or starting your first application.",
    kinds: ["welcome", "add-photo", "first-application"],
  },
} satisfies Record<string, { label: string; description: string; kinds: NotificationKind[] }>;

export type NotificationGroup = keyof typeof MUTABLE_NOTIFICATION_GROUPS;
export const NOTIFICATION_GROUP_KEYS = Object.keys(MUTABLE_NOTIFICATION_GROUPS) as NotificationGroup[];

/** Kinds hidden by the user's muted groups. */
export function mutedKinds(muted: string[]): Set<NotificationKind> {
  const kinds = new Set<NotificationKind>();
  for (const group of NOTIFICATION_GROUP_KEYS) {
    if (muted.includes(group)) MUTABLE_NOTIFICATION_GROUPS[group].kinds.forEach((k) => kinds.add(k));
  }
  return kinds;
}

/** wa.me link for a WhatsApp number typed in any common format. */
export function whatsappLink(number: string) {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}`;
}

export function siteHeroUrl(heroImage: string | null) {
  if (!heroImage) return null;
  return `/api/site/hero?v=${encodeURIComponent(heroImage.split("/").pop() ?? "")}`;
}
