import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const optionalUrl = optionalText(500).refine((v) => v === null || /^https?:\/\//.test(v), "Use a full link starting with https://");

const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 20),
  );

const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

export const courseFormSchema = z.object({
  title: z.string().trim().min(3, "Give the course a title.").max(140),
  subtitle: z.string().trim().min(10, "Add a one-line description (10+ characters).").max(200),
  description: optionalText(5000),
  category: z.enum(["language", "test_prep", "documents", "interview", "other"], { message: "Choose a category." }),
  price: z
    .string()
    .trim()
    .transform((v, ctx) => {
      const n = v === "" ? 0 : Number(v);
      if (!Number.isFinite(n) || n < 0 || n > 10000) {
        ctx.addIssue({ code: "custom", message: "Enter a price between 0 and 10,000 (0 = free)." });
        return z.NEVER;
      }
      return Math.round(n * 100);
    }),
  outcomes: lines,
  instructorId: optionalText(100),
  awardsCertificate: checkbox,
  certificateName: optionalText(140),
  status: z.enum(["draft", "published", "archived"]),
});
export type CourseFormValues = z.infer<typeof courseFormSchema>;

export const lessonFormSchema = z.object({
  title: z.string().trim().min(2, "Give the lesson a title.").max(160),
  summary: optionalText(300),
  content: optionalText(20000),
  videoUrl: optionalUrl,
  durationMinutes: z
    .string()
    .trim()
    .optional()
    .transform((v, ctx) => {
      if (!v) return null;
      const n = Number(v);
      if (!Number.isInteger(n) || n < 1 || n > 600) {
        ctx.addIssue({ code: "custom", message: "Minutes must be a whole number from 1 to 600." });
        return z.NEVER;
      }
      return n;
    }),
  freePreview: checkbox,
});
export type LessonFormValues = z.infer<typeof lessonFormSchema>;

export const webinarFormSchema = z
  .object({
    title: z.string().trim().min(3, "Give the session a title.").max(160),
    description: optionalText(3000),
    hostName: z.string().trim().min(2, "Who is hosting?").max(120),
    /** ISO string built in the browser from the admin's local date/time. */
    startsAt: z
      .string()
      .min(1, "Choose a date and time.")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Choose a valid date and time.")
      .transform((v) => new Date(v)),
    durationMinutes: z.coerce.number().int().min(15, "At least 15 minutes.").max(480, "At most 8 hours."),
    joinUrl: z.string().trim().url("Paste the full Zoom or Google Meet link.").refine((v) => /^https:\/\//.test(v), "The link must start with https://"),
    recordingUrl: optionalUrl,
    access: z.enum(["everyone", "enrolled"]),
    courseId: optionalText(40),
  })
  .refine((v) => v.access === "everyone" || Boolean(v.courseId), { message: "Choose which course's students can attend.", path: ["courseId"] });
export type WebinarFormValues = z.infer<typeof webinarFormSchema>;

export type FormState<T> = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof T, string>>;
};

/** Zod issues → first error per field. */
export function fieldErrorsFrom<T>(issues: z.core.$ZodIssue[]): FormState<T> {
  const fieldErrors: Partial<Record<keyof T, string>> = {};
  for (const issue of issues) {
    const key = issue.path[0] as keyof T;
    fieldErrors[key] ??= issue.message;
  }
  return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
}
