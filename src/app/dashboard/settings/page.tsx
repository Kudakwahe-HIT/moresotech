import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Bell, CircleCheck, CircleAlert, Download, GraduationCap, LifeBuoy, Mail, MessageCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import { SettingsLayout, type SettingsNavItem } from "@/components/account/settings-layout";
import { SettingsRow, SettingsSection } from "@/components/account/settings-section";
import { payments } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteSettings, getUserSettings } from "@/lib/settings";
import { LEVEL_LABELS } from "@/lib/scholarship-labels";
import { NOTIFICATION_GROUP_KEYS, whatsappLink } from "@/lib/settings-rules";
import { DeleteAccount, NotificationPreferences, StudyGoalsForm } from "./settings-forms";

export const metadata: Metadata = {
  title: "Settings | MoreSo Tech",
};

const PROVIDER_NAMES: Record<string, string> = { google: "Google", microsoft: "Microsoft", linkedin_oidc: "LinkedIn", linkedin: "LinkedIn" };


export default async function StudentSettingsPage() {
  const profile = await requireRole("student");
  const [user, settings, site, [payment]] = await Promise.all([
    currentUser(),
    getUserSettings(profile.id),
    getSiteSettings(),
    db.select({ id: payments.id }).from(payments).where(eq(payments.profileId, profile.id)).limit(1),
  ]);

  const connected = (user?.externalAccounts ?? []).map((a) => PROVIDER_NAMES[a.provider.replace(/^oauth_/, "")] ?? a.provider);
  const emailVerified = user?.primaryEmailAddress?.verification?.status === "verified";
  const muted = settings?.mutedNotifications ?? [];
  const goalsSummary = [settings?.targetLevel ? LEVEL_LABELS[settings.targetLevel] : null, settings?.targetIntake].filter(Boolean).join(" · ");

  // Phone list: grouped rows with the current value on the right, like a phone's Settings app.
  const nav: SettingsNavItem[] = [
    { id: "study-goals", label: "Study goals", icon: <GraduationCap />, group: "Preferences", tone: "bg-brand-blue", summary: goalsSummary || "Not set" },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell />,
      group: "Preferences",
      tone: "bg-red-500",
      summary: muted.length === 0 ? "All on" : muted.length === NOTIFICATION_GROUP_KEYS.length ? "Essentials only" : "Some off",
    },
    { id: "security", label: "Sign-in & security", icon: <ShieldCheck />, group: "Account", tone: "bg-slate-600", summary: user?.twoFactorEnabled ? "2-step on" : "2-step off" },
    { id: "data", label: "Your data", icon: <Download />, group: "Account", tone: "bg-violet-500" },
    { id: "help", label: "Help", icon: <LifeBuoy />, group: "Support", tone: "bg-emerald-500" },
    { id: "delete", label: "Delete account", icon: <TriangleAlert />, danger: true },
  ];

  return (
    <SettingsLayout
      title="Settings"
      description="Your study goals, notifications, security and data."
      nav={nav}
      account={{ name: user?.fullName ?? profile.email, email: profile.email, imageUrl: user?.imageUrl ?? "", hasImage: Boolean(user?.hasImage), href: "/dashboard/profile" }}
    >
      <SettingsSection id="study-goals" icon={GraduationCap} title="Study goals" description="Tell us what you're aiming for. Our reviewers see this alongside your applications.">
        <StudyGoalsForm settings={settings} />
      </SettingsSection>

      <SettingsSection id="notifications" icon={Bell} title="Notifications" description="Choose what appears in your notification bell. Changes save straight away.">
        <NotificationPreferences muted={muted} />
      </SettingsSection>

      <SettingsSection id="security" icon={ShieldCheck} title="Sign-in & security" description="Your password, connected accounts and signed-in devices are managed in My profile.">
        <div className="divide-y divide-slate-100">
          <SettingsRow
            label="Email address"
            value={
              <span className="inline-flex flex-wrap items-center gap-2">
                {profile.email}
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CircleCheck className="size-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <CircleAlert className="size-3.5" /> Not verified
                  </span>
                )}
              </span>
            }
            action={<ManageLink href="/dashboard/profile">Manage</ManageLink>}
          />
          <SettingsRow label="Password" value={user?.passwordEnabled ? "Set" : "Not set: you sign in with a connected account"} action={<ManageLink href="/dashboard/profile#/security">{user?.passwordEnabled ? "Change" : "Set a password"}</ManageLink>} />
          <SettingsRow label="Two-step verification" value={user?.twoFactorEnabled ? "On" : "Off"} action={<ManageLink href="/dashboard/profile#/security">{user?.twoFactorEnabled ? "Manage" : "Turn on"}</ManageLink>} />
          <SettingsRow label="Connected accounts" value={connected.length ? connected.join(", ") : "None"} action={<ManageLink href="/dashboard/profile">Manage</ManageLink>} />
          <SettingsRow label="Signed-in devices" value="See where you're signed in and sign out of other devices." action={<ManageLink href="/dashboard/profile#/security">Review</ManageLink>} />
        </div>
      </SettingsSection>

      <SettingsSection id="data" icon={Download} title="Your data" description="Download a copy of everything we hold about you.">
        <p className="text-sm leading-relaxed text-slate-600">
          You&apos;ll get one file with your account details, settings, saved scholarships, applications and their history, the list of documents you uploaded,
          course progress, certificates, session registrations and payments. Your uploaded files stay in your{" "}
          <Link href="/dashboard/documents" className="font-semibold text-brand-blue hover:underline">
            Document Vault
          </Link>
          .
        </p>
        <a
          href="/api/account/export"
          download
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0f1b2d] px-4 text-sm font-semibold text-white transition hover:bg-[#1a2a42]"
        >
          <Download className="size-4" /> Download my data
        </a>
      </SettingsSection>

      <SettingsSection id="help" icon={LifeBuoy} title="Help" description="Questions about an application, a payment or your account?">
        {site.supportEmail || site.supportWhatsapp ? (
          <div className="flex flex-wrap gap-3">
            {site.supportWhatsapp && (
              <a
                href={whatsappLink(site.supportWhatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <MessageCircle className="size-4" /> WhatsApp {site.supportWhatsapp}
              </a>
            )}
            {site.supportEmail && (
              <a href={`mailto:${site.supportEmail}`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <Mail className="size-4" /> {site.supportEmail}
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Reply to any message from our team, or ask your reviewer in your application.</p>
        )}
      </SettingsSection>

      <SettingsSection id="delete" icon={TriangleAlert} danger title="Delete account" description="Permanently remove your account and everything in it.">
        <DeleteAccount hasPayments={Boolean(payment)} supportEmail={site.supportEmail} />
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
