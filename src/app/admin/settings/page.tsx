import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { CircleCheck, CircleAlert, Headset, ImageIcon, Megaphone, PlugZap, UserCog, type LucideIcon } from "lucide-react";
import { SettingsLayout, SettingsRow, SettingsSection, type SettingsNavItem } from "@/components/account/settings-layout";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { paymentsEnabled } from "@/lib/payments";
import { getSiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { SiteSettingsForm } from "./site-settings-form";

export const metadata: Metadata = {
  title: "Settings | Back office",
};

const NAV: SettingsNavItem[] = [
  { id: "support", label: "Support contact", icon: Headset },
  { id: "announcement", label: "Announcement", icon: Megaphone },
  { id: "landing", label: "Landing page", icon: ImageIcon },
  { id: "integrations", label: "Integrations", icon: PlugZap },
  { id: "account", label: "Your account", icon: UserCog },
];

type Status = { label: string; detail: string; ok: boolean; warn?: boolean };

/** Read-only health of the services the platform depends on. Secrets are never shown. */
async function integrationStatus(): Promise<{ name: string; icon?: LucideIcon; status: Status }[]> {
  let dbOk = true;
  try {
    await db.execute(sql`select 1`);
  } catch {
    dbOk = false;
  }
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const clerkLive = clerkKey.startsWith("pk_live_");
  const pesepayEnv = process.env.PESEPAY_ENV === "production" ? "production" : "sandbox";

  return [
    { name: "Database (Neon)", status: dbOk ? { label: "Connected", detail: "Reading and writing normally.", ok: true } : { label: "Unreachable", detail: "Check DATABASE_URL.", ok: false } },
    {
      name: "Sign-in (Clerk)",
      status: !clerkKey
        ? { label: "Not configured", detail: "Add the Clerk keys.", ok: false }
        : clerkLive
          ? { label: "Live", detail: "Production instance.", ok: true }
          : { label: "Development", detail: "Using a development instance: fine for testing, switch to production keys before launch.", ok: true, warn: true },
    },
    {
      name: "File storage (Vercel Blob)",
      status: process.env.BLOB_READ_WRITE_TOKEN ? { label: "Connected", detail: "Documents and pictures are stored privately.", ok: true } : { label: "Not configured", detail: "Uploads won't work until BLOB_READ_WRITE_TOKEN is set.", ok: false },
    },
    {
      name: "Payments (Pesepay)",
      status: paymentsEnabled()
        ? pesepayEnv === "production"
          ? { label: "Live", detail: "Real payments. Paid courses unlock automatically.", ok: true }
          : { label: "Sandbox", detail: "Test payments only; no real money moves.", ok: true, warn: true }
        : { label: "Not connected", detail: "Students see “Request enrollment” instead of checkout.", ok: false, warn: true },
    },
  ];
}

export default async function AdminSettingsPage() {
  await requireRole("admin");
  const [site, integrations] = await Promise.all([getSiteSettings(), integrationStatus()]);

  return (
    <SettingsLayout title="Settings" description="Platform-wide settings for MoreSo Tech. Changes apply to everyone." nav={NAV}>
      <SiteSettingsForm site={site} />

      <SettingsSection id="integrations" icon={PlugZap} title="Integrations" description="Services the platform relies on. Keys are managed in your hosting environment, never here.">
        <ul className="divide-y divide-slate-100">
          {integrations.map(({ name, status }) => (
            <li key={name} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{status.detail}</p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  !status.ok ? "bg-red-50 text-red-700" : status.warn ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700",
                )}
              >
                {status.ok && !status.warn ? <CircleCheck className="size-3.5" /> : <CircleAlert className="size-3.5" />} {status.label}
              </span>
            </li>
          ))}
        </ul>
      </SettingsSection>

      <SettingsSection id="account" icon={UserCog} title="Your account" description="Your own sign-in and security, and who else has staff access.">
        <div className="divide-y divide-slate-100">
          <SettingsRow label="Profile & sign-in" value="Name, photo, email and connected accounts." action={<ManageLink href="/admin/profile">Open profile</ManageLink>} />
          <SettingsRow label="Password & two-step verification" value="Staff accounts should have two-step verification on." action={<ManageLink href="/admin/profile#/security">Security</ManageLink>} />
          <SettingsRow label="Staff & roles" value="Add instructors and admins, or change someone's role." action={<ManageLink href="/admin/staff">Manage staff</ManageLink>} />
        </div>
      </SettingsSection>
    </SettingsLayout>
  );
}

function ManageLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
      {children}
    </Link>
  );
}
