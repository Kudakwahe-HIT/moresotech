import { z } from "zod";

/** Multi-line textarea → trimmed, non-empty lines. */
const lines = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? "")
      .split(/\r?\n/)
      .map((l) => l.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 30),
  );

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

const optionalDate = z
  .string()
  .optional()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use a valid date.");

export const scholarshipFormSchema = z
  .object({
    title: z.string().trim().min(3, "Give the scholarship a title.").max(160),
    provider: z.string().trim().min(2, "Who offers it? e.g. NIIED (Korean Government).").max(160),
    university: optionalText(160),
    country: z.string().trim().min(2).max(80).default("South Korea"),
    level: z.enum(["language", "undergraduate", "masters", "phd", "research"], { message: "Choose a level." }),
    fundingType: z.enum(["full", "partial", "tuition", "stipend"], { message: "Choose a funding type." }),
    amount: optionalText(200),
    summary: z.string().trim().min(20, "Write at least a sentence (20+ characters).").max(300),
    description: optionalText(5000),
    eligibility: lines,
    benefits: lines,
    requiredDocuments: lines,
    requiredCertificates: lines,
    intake: optionalText(80),
    opensAt: optionalDate,
    deadline: optionalDate,
    applyUrl: optionalText(500).refine((v) => v === null || /^https?:\/\//.test(v), "Use a full link starting with https://"),
    status: z.enum(["draft", "published", "closed"]),
    featured: z
      .string()
      .optional()
      .transform((v) => v === "on"),
  })
  .refine((v) => !v.opensAt || !v.deadline || v.opensAt <= v.deadline, {
    message: "The deadline must be on or after the opening date.",
    path: ["deadline"],
  });

export type ScholarshipFormValues = z.infer<typeof scholarshipFormSchema>;

export type ScholarshipFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof ScholarshipFormValues, string>>;
};
