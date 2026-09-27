import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { AnnouncementBar } from "@/components/shell/announcement-bar";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications";
import { activeAnnouncement, getSiteSettings } from "@/lib/settings";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Students only: staff are redirected to their own area (see requireRole).
  const profile = await requireRole("student");
  const [user, site] = await Promise.all([currentUser().then((u) => u!), getSiteSettings()]);
  const email = profile.email;
  const announcement = activeAnnouncement(site);

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
      {announcement && <AnnouncementBar {...announcement} className="mb-6" />}
      {children}
    </DashboardShell>
  );
}
