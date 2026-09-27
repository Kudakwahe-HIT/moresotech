"use client";

import Link from "next/link";
import { useState } from "react";
import { Popover } from "@base-ui/react/popover";
import { Bell, ChevronRight } from "lucide-react";
import type { AppNotification } from "@/lib/notifications";
import { NotificationIcon } from "./notification-icon";

export function NotificationsPopover({ notifications }: { notifications: AppNotification[] }) {
  const [open, setOpen] = useState(false);
  const actionCount = notifications.filter((n) => n.actionRequired).length;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={actionCount ? `Notifications, ${actionCount} need your attention` : "Notifications"}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/15 data-[popup-open]:border-brand-blue/30 data-[popup-open]:text-brand-blue"
      >
        <Bell className="size-[18px]" />
        {actionCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-brand-orange text-[0.65rem] font-bold text-white ring-2 ring-[#f4f6f9]">
            {actionCount}
          </span>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={10} className="z-50 outline-none">
          <Popover.Popup className="w-[min(380px,calc(100vw-2rem))] origin-(--transform-origin) overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Popover.Title className="text-base font-bold text-slate-900">Notifications</Popover.Title>
              {actionCount > 0 && (
                <span className="rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-semibold text-brand-orange-dark">
                  {actionCount} to do
                </span>
              )}
            </div>

            <ul className="max-h-[min(360px,60dvh)] divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex gap-3.5 px-5 py-4 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                  >
                    <NotificationIcon kind={n.id} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                        {n.actionRequired && <span aria-label="Action needed" className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-orange" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[0.8rem] leading-relaxed text-slate-500">{n.body}</p>
                      <p className="mt-1.5 text-xs text-slate-400">{n.time}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1 border-t border-slate-100 px-5 py-3.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-slate-50 hover:text-brand-blue-dark"
            >
              View all notifications
              <ChevronRight className="size-4" />
            </Link>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
