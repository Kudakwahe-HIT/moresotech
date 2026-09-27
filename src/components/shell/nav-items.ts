import {
  Bell,
  BookOpen,
  Presentation,
  ClipboardCheck,
  FolderLock,
  GraduationCap,
  LayoutGrid,
  Settings,
  UserCog,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };
export type ShellArea = "student" | "instructor" | "admin";

/** Student sidebar. Sections without a page yet show "coming soon". */
export const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Scholarships", href: "/dashboard/scholarships", icon: GraduationCap },
  { label: "My Applications", href: "/dashboard/applications", icon: ClipboardCheck },
  { label: "Document Vault", href: "/dashboard/documents", icon: FolderLock },
  { label: "Courses & Certs", href: "/dashboard/courses", icon: BookOpen },
  { label: "Webinars", href: "/dashboard/webinars", icon: Video },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/** Back-office sidebar (admins only). */
export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Scholarships", href: "/admin/scholarships", icon: GraduationCap },
  { label: "Applicants", href: "/admin/applicants", icon: Users },
  { label: "Courses & Certs", href: "/admin/courses", icon: BookOpen },
  { label: "Webinars", href: "/admin/webinars", icon: Video },
  { label: "Staff & Roles", href: "/admin/staff", icon: UserCog },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

/** Teaching area (instructors, and admins who teach). */
export const INSTRUCTOR_NAV: NavItem[] = [
  { label: "Overview", href: "/teach", icon: LayoutGrid },
  { label: "My courses", href: "/teach/courses", icon: Presentation },
  { label: "Sessions", href: "/teach/webinars", icon: Video },
];

export const NAV_BY_AREA: Record<ShellArea, NavItem[]> = { student: STUDENT_NAV, instructor: INSTRUCTOR_NAV, admin: ADMIN_NAV };

/** Label + home for each area, used by the avatar menu's area switcher. */
export const AREA_META: Record<ShellArea, { label: string; badge?: string }> = {
  student: { label: "Student view" },
  instructor: { label: "Teaching", badge: "Instructor" },
  admin: { label: "Back office", badge: "Back office" },
};

/** Areas a role may open. */
export function areasFor(role: "student" | "instructor" | "admin"): ShellArea[] {
  if (role === "admin") return ["student", "instructor", "admin"];
  if (role === "instructor") return ["student", "instructor"];
  return ["student"];
}

/** Home link for each area; matched exactly so it isn't highlighted on every sub-page. */
export const AREA_HOME: Record<ShellArea, string> = { student: "/dashboard", instructor: "/teach", admin: "/admin" };
