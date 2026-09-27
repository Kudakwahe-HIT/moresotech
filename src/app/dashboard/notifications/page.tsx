import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { NotificationIcon } from "@/components/shell/notification-icon";
import { getNotifications, type AppNotification } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "Notifications | MoreSo Tech",
};

export default async function NotificationsPage() {
  // proxy.ts guarantees a signed-in user here.
  const [user, profile] = await Promise.all([currentUser().then((u) => u!), requireRole("student")]);
  const notifications = await getNotifications(user, profile.id);
  const actionNeeded = notifications.filter((n) => n.actionRequired);
  const earlier = notifications.filter((n) => !n.actionRequired);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h2>
        <p className="mt-1 text-sm text-slate-500">
          {actionNeeded.length
            ? `You have ${actionNeeded.length} thing${actionNeeded.length === 1 ? "" : "s"} to take care of.`
            : "You're all caught up."}
        </p>
      </div>

      {actionNeeded.length > 0 && <NotificationGroup title="Needs your attention" items={actionNeeded} />}
      {earlier.length > 0 && <NotificationGroup title="Earlier" items={earlier} />}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
            <Inbox className="size-7" />
          </div>
          <p className="mt-4 font-bold text-slate-900">No notifications</p>
          <p className="mt-1 text-sm text-slate-500">We&apos;ll let you know when something needs your attention.</p>
        </div>
      )}
    </div>
  );
}

function NotificationGroup({ title, items }: { title: string; items: AppNotification[] }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        {items.map((n) => (
          <li key={n.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex min-w-0 flex-1 gap-4">
              <NotificationIcon kind={n.kind} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {n.actionRequired && <span aria-label="Action needed" className="size-2 shrink-0 rounded-full bg-brand-orange" />}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{n.body}</p>
                <p className="mt-2 text-xs text-slate-400">{n.time}</p>
              </div>
            </div>
            <Link
              href={n.href}
              className={
                n.actionRequired
                  ? "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(245,130,32,0.6)] transition hover:bg-brand-orange-dark sm:self-center"
                  : "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
              }
            >
              {n.cta}
              <ArrowRight className="size-4" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
