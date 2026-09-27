import { redirect } from "next/navigation";
import { getProfile, homeFor } from "@/lib/auth";

/** No public landing page yet: signed-in users go to their own area, everyone else to sign in. */
export default async function Home() {
  const profile = await getProfile();
  redirect(profile ? homeFor(profile.role) : "/sign-in");
}
