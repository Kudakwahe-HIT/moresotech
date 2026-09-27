import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Award, BadgeCheck, CircleAlert, ListVideo, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { courses, enrollments, lessons } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { COURSE_CATEGORIES, formatPrice, hasCourseAccess } from "@/lib/learning-rules";
import { listPaymentMethods, paymentFlow, paymentsEnabled } from "@/lib/payments";
import { CheckoutForm, type CheckoutMethod } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout | MoreSo Tech",
};

export default async function CheckoutPage({ params }: PageProps<"/dashboard/checkout/[slug]">) {
  const { slug } = await params;
  const profile = await requireRole("student");

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.slug, slug), eq(courses.status, "published")))
    .limit(1);
  if (!course || course.priceCents <= 0) notFound();

  const [enrollment] = await db
    .select({ status: enrollments.status })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, course.id), eq(enrollments.profileId, profile.id)))
    .limit(1);
  // Already paid: straight to the course.
  if (hasCourseAccess(enrollment?.status)) redirect(`/dashboard/courses/${course.slug}`);

  const lessonCount = (await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, course.id))).length;
  const amountLabel = formatPrice(course.priceCents, course.currency);

  let methods: CheckoutMethod[] = [];
  let unavailable = !paymentsEnabled();
  if (!unavailable) {
    try {
      methods = (await listPaymentMethods(course.currency, course.priceCents / 100)).map((m) => {
        const redirect = paymentFlow(m) === "redirect";
        return {
          code: m.code,
          name: m.name,
          description: m.description ?? null,
          redirect,
          // Hosted-page methods ask for nothing here; phone-prompt methods ask only for the number.
          fields: redirect
            ? []
            : (m.requiredFields ?? []).map((f) => ({ name: f.name, label: f.displayName ?? "Mobile number", type: "TEXT", optional: false })),
        };
      });
      unavailable = methods.length === 0;
    } catch (error) {
      console.error("Couldn't load Pesepay payment methods", error);
      unavailable = true;
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href={`/dashboard/courses/${course.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" /> Back to course
      </Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Secure checkout</h1>
        <p className="mt-1 text-sm text-slate-500">Pay with mobile money or card through Pesepay. Access unlocks the moment your payment is confirmed.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {unavailable ? (
            <div role="alert" className="rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <CircleAlert className="size-5 text-amber-500" /> Online payment is temporarily unavailable
              </p>
              <p className="mt-2 text-sm text-slate-500">
                You can still request enrollment from the course page and our team will arrange payment with you.
              </p>
              <Link href={`/dashboard/courses/${course.slug}`} className="mt-4 inline-flex h-10 items-center rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white">
                Back to course
              </Link>
            </div>
          ) : (
            <CheckoutForm courseId={course.id} methods={methods} amountLabel={amountLabel} email={profile.email} />
          )}
        </div>

        {/* Order summary */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="relative bg-[#0f1b2d] p-5 text-white">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-brand-orange/25 blur-2xl" />
              <p className="relative text-xs font-semibold uppercase tracking-wider text-slate-400">{COURSE_CATEGORIES[course.category]}</p>
              <p className="relative mt-1 font-bold leading-snug">{course.title}</p>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <p className="flex items-center gap-2 text-slate-600">
                <ListVideo className="size-4 text-slate-400" /> {lessonCount} lesson{lessonCount === 1 ? "" : "s"}, lifetime access
              </p>
              {course.awardsCertificate && (
                <p className="flex items-center gap-2 text-slate-600">
                  <Award className="size-4 text-brand-orange" /> {course.certificateName ?? "Verified certificate"}
                </p>
              )}
              <p className="flex items-center gap-2 text-slate-600">
                <Zap className="size-4 text-emerald-500" /> Unlocks instantly after payment
              </p>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex justify-between text-slate-500">
                  <span>Course</span>
                  <span>{amountLabel}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">{amountLabel}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Your provider may add its own transaction fee.</p>
              </div>
            </div>
          </div>

          <ul className="space-y-2.5 rounded-3xl bg-white p-5 text-xs text-slate-600 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-px size-4 shrink-0 text-emerald-500" /> Processed securely by Pesepay, a Zimbabwean payment gateway.
            </li>
            <li className="flex items-start gap-2.5">
              <LockKeyhole className="mt-px size-4 shrink-0 text-emerald-500" /> We never see your PIN or card number.
            </li>
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-px size-4 shrink-0 text-emerald-500" /> You&apos;ll get a receipt in your account right away.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
