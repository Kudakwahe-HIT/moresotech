import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { requireRole } from "@/lib/auth";

export default async function TeachLayout({ children }: { children: ReactNode }) {
  // Students get a 404 so the teaching area isn't advertised.
  const profile = await requireRole("instructor", "admin");
  const user = (await currentUser())!;

  return (
    <DashboardShell
      area="instructor"
      notifications={[]}
      notificationsHref="/teach"
      user={{
        firstName: user.firstName,
        name: user.fullName ?? profile.email,
        email: profile.email,
        imageUrl: user.imageUrl,
        hasImage: user.hasImage,
        role: profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
