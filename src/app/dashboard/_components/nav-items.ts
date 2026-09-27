import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  MessageSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Sidebar sections. Everything except Dashboard shows a "coming soon" page for now. */
export const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "My Classes", href: "/dashboard/classes", icon: ClipboardList },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Community", href: "/dashboard/community", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
