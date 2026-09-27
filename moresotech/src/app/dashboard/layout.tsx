import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "./_components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // proxy.ts guarantees a signed-in user here.
  const user = (await currentUser())!;
  const email = user.primaryEmailAddress?.emailAddress ?? "";

  return (
    <DashboardShell
      user={{
        firstName: user.firstName,
        name: user.fullName ?? email,
        email,
        imageUrl: user.imageUrl,
        hasImage: user.hasImage,
      }}
    >
      {children}
    </DashboardShell>
  );
}
