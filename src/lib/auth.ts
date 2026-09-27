import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { profiles, type Profile, type Role } from "@/db/schema";

/**
 * The signed-in user's app profile, created on first visit and kept in sync with Clerk
 * (email, name, photo). Cached per request, so layouts and pages can all call it cheaply.
 * Returns null when signed out.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await currentUser();
  if (!user) return null;

  const values = {
    email: user.primaryEmailAddress?.emailAddress ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.hasImage ? user.imageUrl : null,
  };

  // Role is never overwritten here: it is only changed by an admin or scripts/set-role.mjs.
  const [profile] = await db
    .insert(profiles)
    .values({ id: user.id, ...values })
    .onConflictDoUpdate({ target: profiles.id, set: { ...values, updatedAt: new Date() } })
    .returning();
  return profile;
});

/** For pages: signed-out users go to sign-in; signed-in users without the role get a 404. */
export async function requireRole(...roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/sign-in");
  if (!roles.includes(profile.role)) notFound();
  return profile;
}

/** For server actions: throws instead of redirecting, so a forged request can't do anything. */
export async function assertRole(...roles: Role[]): Promise<Profile> {
  const profile = await getProfile();
  if (!profile || !roles.includes(profile.role)) throw new Error("Not authorised");
  return profile;
}
