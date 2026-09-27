"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppNotification } from "../_lib/notifications";
import { NAV_ITEMS } from "./nav-items";
import { NotificationsPopover } from "./notifications-popover";
import { ProfileMenu } from "./profile-menu";
import { SignOutButton } from "./sign-out-button";
import { UserAvatar } from "./user-avatar";

export type ShellUser = {
  firstName: string | null;
  name: string;
  email: string;
  imageUrl: string;
  hasImage: boolean;
};

export function DashboardShell({
  user,
  notifications,
  children,
}: {
  user: ShellUser;
  notifications: AppNotification[];
  children: ReactNode;
}) {
  const actionCount = notifications.filter((n) => n.actionRequired).length;
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-1 bg-[#f4f6f9] text-slate-900 lg:p-4">
      {/* Mobile overlay */}
      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <Sidebar
        pathname={pathname}
        user={user}
        badges={{ "/dashboard/notifications": actionCount }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-6">
        <TopBar user={user} notifications={notifications} onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-0 lg:pr-2">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  user,
  badges,
  open,
  onClose,
}: {
  pathname: string;
  user: ShellUser;
  /** Small count shown next to a nav item, keyed by href. */
  badges: Record<string, number>;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-[#0f1b2d] p-5 text-slate-300 transition-transform duration-300",
        "lg:sticky lg:top-4 lg:h-[calc(100dvh-2rem)] lg:translate-x-0 lg:rounded-3xl",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          aria-label="MoreSo Tech dashboard"
          className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-white px-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
        >
          <Image src="/moresotech-logo.png" alt="MoreSo Tech" width={865} height={288} priority className="h-11 w-auto" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="ml-3 flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav aria-label="Dashboard" className="mt-8 flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/60",
                active
                  ? "bg-brand-orange font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.7)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
              )}
            >
              <item.icon className={cn("size-[18px]", active ? "text-white" : "text-slate-500 group-hover:text-white")} />
              <span className="flex-1">{item.label}</span>
              {!!badges[item.href] && (
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold",
                    active ? "bg-white text-brand-orange-dark" : "bg-brand-orange/90 text-white",
                  )}
                >
                  {badges[item.href]}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Signed-in user + sign out */}
      <div className="mt-4 rounded-2xl bg-white/[0.06] p-3.5">
        <div className="flex items-center gap-3">
          <UserAvatar imageUrl={user.imageUrl} hasImage={user.hasImage} name={user.name} size={40} className="ring-2 ring-white/10" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
        <SignOutButton variant="sidebar" />
      </div>
    </aside>
  );
}

function TopBar({
  user,
  notifications,
  onOpenMenu,
}: {
  user: ShellUser;
  notifications: AppNotification[];
  onOpenMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-[#f4f6f9]/85 px-4 py-4 backdrop-blur-md sm:px-6 lg:static lg:bg-transparent lg:px-0 lg:pb-6 lg:pr-2 lg:pt-3 lg:backdrop-blur-none">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open menu"
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-[1.75rem]">
        {/* Shorter greeting on phones so the name isn't cut off */}
        <span className="sm:hidden">Hi</span>
        <span className="hidden sm:inline">Welcome back</span>
        {user.firstName ? `, ${user.firstName}` : ""} <span aria-hidden>👋</span>
      </h1>

      <label className="relative hidden w-72 md:block">
        <span className="sr-only">Search courses</span>
        <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search courses"
          className="h-11 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
        />
      </label>

      <NotificationsPopover notifications={notifications} />
      <ProfileMenu user={user} />
    </header>
  );
}
