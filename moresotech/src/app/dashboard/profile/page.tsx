import type { Metadata } from "next";
import type { ReactNode } from "react";
import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { CalendarDays, CircleCheck, CircleAlert, ShieldCheck } from "lucide-react";
import { UserAvatar } from "../_components/user-avatar";

export const metadata: Metadata = {
  title: "My profile | MoreSo Tech",
};

const PROVIDER_NAMES: Record<string, string> = {
  google: "Google",
  microsoft: "Microsoft",
  linkedin_oidc: "LinkedIn",
  linkedin: "LinkedIn",
};

export default async function ProfilePage() {
  // proxy.ts guarantees a signed-in user here.
  const user = (await currentUser())!;
  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const name = user.fullName ?? email;
  const emailVerified = user.primaryEmailAddress?.verification?.status === "verified";
  const provider = user.externalAccounts[0]?.provider.replace(/^oauth_/, "");
  const signInMethod = provider ? (PROVIDER_NAMES[provider] ?? provider) : "Email & password";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand-blue/[0.07] blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <UserAvatar imageUrl={user.imageUrl} hasImage={user.hasImage} name={name} size={88} className="ring-4 ring-slate-100" />
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">{name}</h2>
            <p className="truncate text-sm text-slate-500">{email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip>
                {emailVerified ? (
                  <>
                    <CircleCheck className="size-3.5 text-emerald-600" /> Email verified
                  </>
                ) : (
                  <>
                    <CircleAlert className="size-3.5 text-amber-600" /> Email not verified
                  </>
                )}
              </Chip>
              <Chip>
                <ShieldCheck className="size-3.5 text-brand-blue" /> {signInMethod}
              </Chip>
              <Chip>
                <CalendarDays className="size-3.5 text-slate-400" /> Member since {memberSince}
              </Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Clerk's account manager: photo, name, emails, password, connected accounts, active devices */}
      <UserProfile
        routing="hash"
        appearance={{
          variables: {
            colorPrimary: "#0b5c9c",
            fontFamily: "var(--font-inter), sans-serif",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "w-full",
            cardBox: "w-full max-w-none rounded-3xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] border-0",
          },
        }}
      />
    </div>
  );
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}
