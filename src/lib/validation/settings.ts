import { z } from "zod";
import { isCoverPath, SITE_PREFIX } from "@/lib/course-cover";
import { KOREAN_LEVELS, NOTIFICATION_GROUP_KEYS } from "@/lib/settings-rules";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .optional()
    .transform((v) => v || null);

const optionalPhone = optionalText(30).refine((v) => v === null || /^\+?[\d\s()-]{7,20}$/.test(v), "Enter a phone number with country code, e.g. +263 77 123 4567.");

/** Sentinel the dropdowns use for "not set" (Base UI treats an empty string as unselected). */
export const NOT_SET = "none_selected";
const optionalChoice = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .string()
    .optional()
    .transform((v) => (v && v !== NOT_SET ? v : null))
    .refine((v): v is T | null => v === null || (values as readonly string[]).includes(v), "Choose one of the options.");

export const studyGoalsSchema = z.object({
  targetLevel: optionalChoice(["language", "undergraduate", "masters", "phd", "research"] as const),
  targetIntake: optionalText(40),
  fieldOfStudy: optionalText(120),
  koreanLevel: optionalChoice(Object.keys(KOREAN_LEVELS) as [string, ...string[]]),
  country: optionalText(80),
  phone: optionalPhone,
});
export type StudyGoalsValues = z.infer<typeof studyGoalsSchema>;

/** Checkboxes are named after the groups; a group that isn't ticked is muted. */
export function mutedFromForm(formData: FormData) {
  return NOTIFICATION_GROUP_KEYS.filter((g) => formData.get(g) !== "on");
}

export const siteSettingsSchema = z
  .object({
    supportEmail: optionalText(160).refine((v) => v === null || z.email().safeParse(v).success, "Enter a valid email address."),
    supportWhatsapp: optionalPhone,
    heroImage: optionalText(300).refine((v) => v === null || isCoverPath(v, SITE_PREFIX), "Upload the picture again."),
    announcementActive: z
      .string()
      .optional()
      .transform((v) => v === "on"),
    announcementText: optionalText(180),
    announcementLink: optionalText(300).refine((v) => v === null || /^(https:\/\/|\/)/.test(v), "Use a full https:// link or a page path like /dashboard/webinars."),
  })
  .refine((v) => !v.announcementActive || Boolean(v.announcementText), { message: "Write the announcement, or switch it off.", path: ["announcementText"] });
export type SiteSettingsValues = z.infer<typeof siteSettingsSchema>;
