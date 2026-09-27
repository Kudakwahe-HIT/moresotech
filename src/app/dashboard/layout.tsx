import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Every role can use the student area (admins included, to see what students see).
  const profile = await requireRole("student", "instructor", "admin");
  const user = (await currentUser())!;
  const email = profile.email;

  return (
    <DashboardShell
      area="student"
      notifications={await getNotifications(user, profile.id)}
      user={{
        firstName: user.firstName,
        name: user.fullName ?? email,
        email,
        imageUrl: user.imageUrl,
        hasImage: user.hasImage,
        role: profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
