"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { useClerk } from "@clerk/nextjs";
import { ArrowLeftRight, Bell, LogOut, Settings, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import type { ShellUser } from "./dashboard-shell";
import type { ShellArea } from "./nav-items";
import { UserAvatar } from "./user-avatar";

const LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "My profile", href: "/dashboard/profile", icon: UserRound },
  { label: "Account security", href: "/dashboard/profile#/security", icon: ShieldCheck },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function ProfileMenu({ area, user }: { area: ShellArea; user: ShellUser }) {
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  return (
    <Menu.Root open={open} onOpenChange={setOpen}>
      <Menu.Trigger
        aria-label="Open account menu"
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20 data-[popup-open]:ring-4 data-[popup-open]:ring-brand-blue/15"
      >
        <UserAvatar
          imageUrl={user.imageUrl}
          hasImage={user.hasImage}
          name={user.name}
          size={44}
          className="ring-2 ring-white shadow-sm"
        />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={10} className="z-50 outline-none">
          <Menu.Popup className="w-72 origin-(--transform-origin) overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
              <UserAvatar imageUrl={user.imageUrl} hasImage={user.hasImage} name={user.name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="py-1.5">
              {/* Admins can hop between the student view and the back office */}
              {user.role === "admin" && (
                <Menu.LinkItem
                  render={<Link href={area === "admin" ? "/dashboard" : "/admin"} />}
                  onClick={() => setOpen(false)}
                  className={`${itemClass} font-semibold text-brand-blue`}
                >
                  <span className="flex items-center gap-3">
                    <ArrowLeftRight className="size-4 text-brand-blue" />
                    {area === "admin" ? "Switch to student view" : "Open back office"}
                  </span>
                </Menu.LinkItem>
              )}
              {LINKS.map((link) => (
                <Menu.LinkItem
                  key={link.href}
                  render={<Link href={link.href} />}
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  <ItemContent icon={link.icon}>{link.label}</ItemContent>
                </Menu.LinkItem>
              ))}
            </div>

            <Menu.Separator className="mx-2 my-1 h-px bg-slate-100" />

            <Menu.Item
              onClick={() => signOut({ redirectUrl: "/sign-in" })}
              className={`${itemClass} text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-600`}
            >
              <ItemContent icon={LogOut} danger>
                Sign out
              </ItemContent>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

const itemClass =
  "flex h-10 cursor-pointer select-none items-center rounded-xl px-3 text-sm font-medium text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900";

function ItemContent({ icon: Icon, danger, children }: { icon: LucideIcon; danger?: boolean; children: ReactNode }) {
  return (
    <span className="flex items-center gap-3">
      <Icon className={danger ? "size-4 text-red-500" : "size-4 text-slate-400"} />
      {children}
    </span>
  );
}
