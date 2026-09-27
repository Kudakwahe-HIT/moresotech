import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { DashboardShell } from "@/components/shell/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { countApplicationsNeedingReview } from "@/lib/applications";
import type { AppNotification } from "@/lib/notifications";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Non-admins get a 404, so the back office isn't advertised to students.
  const profile = await requireRole("admin");
  const [user, needsReview] = await Promise.all([currentUser().then((u) => u!), countApplicationsNeedingReview()]);
  const notifications: AppNotification[] = needsReview
    ? [
        {
          id: "review-queue",
          kind: "in-review",
          title: `${needsReview} application${needsReview === 1 ? "" : "s"} need review`,
          body: "New uploads or submissions are waiting in the review queue.",
          href: "/admin/applicants",
          cta: "Open queue",
          actionRequired: true,
          time: "now",
        },
      ]
    : [];

  return (
    <DashboardShell
      area="admin"
      notifications={notifications}
      navBadges={{ "/admin/applicants": needsReview }}
      notificationsHref="/admin/applicants"
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
