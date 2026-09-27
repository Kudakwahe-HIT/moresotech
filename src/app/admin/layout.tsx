import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Non-admins get a 404, so the back office isn't advertised to students.
  const profile = await requireRole("admin");
  const user = (await currentUser())!;

  return (
    <DashboardShell
      area="admin"
      notifications={getNotifications(user)}
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
