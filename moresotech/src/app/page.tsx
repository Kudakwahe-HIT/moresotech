import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

/** No public landing page yet: signed-in users go to their dashboard, everyone else to sign in. */
export default async function Home() {
  const { userId } = await auth();
  redirect(userId ? "/dashboard" : "/sign-in");
}
