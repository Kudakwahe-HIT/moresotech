import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings, userSettings, type SiteSettings, type UserSettings } from "@/db/schema";

/** A user's settings, or null if they've never saved any (everything then uses its default). */
export async function getUserSettings(profileId: string): Promise<UserSettings | null> {
  const [row] = await db.select().from(userSettings).where(eq(userSettings.profileId, profileId)).limit(1);
  return row ?? null;
}

const EMPTY_SITE: SiteSettings = {
  id: 1,
  supportEmail: null,
  supportWhatsapp: null,
  heroImage: null,
  announcementActive: false,
  announcementText: null,
  announcementLink: null,
  updatedBy: null,
  updatedAt: new Date(0),
};

/** Platform-wide settings (single row). Cached per request because several layouts read it. */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? EMPTY_SITE;
});

/** The announcement to show, or null when it's switched off or empty. */
export function activeAnnouncement(site: SiteSettings) {
  if (!site.announcementActive || !site.announcementText) return null;
  return { text: site.announcementText, link: site.announcementLink };
}
