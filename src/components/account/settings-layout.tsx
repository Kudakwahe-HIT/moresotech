"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { useClerk } from "@clerk/nextjs";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { UserAvatar } from "@/components/shell/user-avatar";
import { cn } from "@/lib/utils";

export type SettingsNavItem = {
  id: string;
  label: string;
  /** Rendered icon, e.g. <Bell />. (Elements, not components, so server pages can pass them.) */
  icon: ReactNode;
  /** Mobile list: the group heading this row sits under. */
  group?: string;
  /** Mobile list: short current value on the right, like "On" or an email address. */
  summary?: string;
  /** Mobile list: colour of the icon tile, e.g. "bg-emerald-500". */
  tone?: string;
  danger?: boolean;
};

type Account = { name: string; email: string; imageUrl: string; hasImage: boolean; href: string };

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * Settings frame. Wide screens: title, a sticky section list and every section on one page.
 * Phones: works like a phone's Settings app. A grouped list of rows opens one section at a time
 * (driven by the URL hash, so the phone's back gesture returns to the list).
 */
export function SettingsLayout({
  title,
  description,
  nav,
  account,
  children,
}: {
  title: string;
  description: string;
  nav: SettingsNavItem[];
  account?: Account;
  children: ReactNode;
}) {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash.slice(1), () => "");
  const current = nav.find((n) => n.id === hash);
  const openedFromList = useRef(false);

  // Each phone "screen" starts at the top, like navigating in an app.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1023.98px)").matches) window.scrollTo({ top: 0 });
  }, [hash]);

  function backToList() {
    if (openedFromList.current) {
      openedFromList.current = false;
      window.history.back();
    } else {
      // Arrived straight on a section (e.g. a shared link): go "up" without leaving the page.
      window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  const groups = nav.reduce<{ name?: string; items: SettingsNavItem[] }[]>((list, item) => {
    const last = list.at(-1);
    if (last && last.name === item.group) last.items.push(item);
    else list.push({ name: item.group, items: [item] });
    return list;
  }, []);

  return (
    <div className="space-y-6">
      {/* Phones: which screen is showing. Only our own section ids are ever interpolated. */}
      <style>{`@media (max-width: 1023.98px) {
        [data-settings-panels] [data-settings-section] { display: none; }
        [data-settings-savebar] { display: none; }
        ${current ? `[data-settings-panels] #${current.id} { display: block; } form:has(#${current.id}) [data-settings-savebar] { display: block; } [data-settings-panels] form:has([data-settings-section]):not(:has(#${current.id})) { display: none; }` : "[data-settings-panels] { display: none; }"}
      }`}</style>

      {/* ── Wide screens: page header ─────────────────────────── */}
      <div className="max-lg:hidden">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {/* ── Phones: the list of settings ──────────────────────── */}
      {!current && (
        <div className="space-y-6 lg:hidden">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>

          {account && (
            <Link href={account.href} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] active:bg-slate-50">
              <UserAvatar imageUrl={account.imageUrl} hasImage={account.hasImage} name={account.name} size={56} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold text-slate-900">{account.name}</span>
                <span className="block truncate text-sm text-slate-500">{account.email}</span>
                <span className="mt-0.5 block text-xs font-medium text-brand-blue">Profile, photo & sign-in</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-slate-300" />
            </Link>
          )}

          {groups.map((group, i) => (
            <section key={group.name ?? `group-${i}`} aria-label={group.name}>
              {group.name && <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-400">{group.name}</h3>}
              <ul className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
                {group.items.map((item) => (
                  <li key={item.id} className="border-b border-slate-100 last:border-0">
                    <a
                      href={`#${item.id}`}
                      onClick={() => {
                        openedFromList.current = true;
                      }}
                      className="flex min-h-14 items-center gap-3.5 px-4 py-3 transition-colors active:bg-slate-50"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg text-white [&_svg]:size-[18px]",
                          item.danger ? "bg-red-500" : (item.tone ?? "bg-brand-blue"),
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className={cn("min-w-0 flex-1 truncate text-[0.95rem] font-medium", item.danger ? "text-red-600" : "text-slate-900")}>{item.label}</span>
                      {item.summary && <span className="max-w-[45%] truncate text-sm text-slate-400">{item.summary}</span>}
                      <ChevronRight className="size-5 shrink-0 text-slate-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <MobileSignOut />
        </div>
      )}

      {/* ── Phones: top bar of an open section ─────────────────── */}
      {current && (
        <div className="sticky top-0 z-20 -mx-4 flex h-12 items-center border-b border-slate-200/70 bg-[#f4f6f9]/90 px-2 backdrop-blur-md sm:-mx-6 lg:hidden">
          <button type="button" onClick={backToList} className="inline-flex h-10 items-center gap-0.5 rounded-xl pl-1 pr-3 text-[0.95rem] font-medium text-brand-blue active:bg-brand-blue/10">
            <ChevronLeft className="size-6" /> {title}
          </button>
          <h2 className="pointer-events-none absolute inset-x-0 truncate px-28 text-center text-[0.95rem] font-semibold text-slate-900">{current.label}</h2>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* ── Wide screens: sticky section list ───────────────── */}
        <nav aria-label="Settings sections" className="max-lg:hidden lg:sticky lg:top-6 lg:self-start">
          <ul className="flex flex-col gap-1 rounded-2xl bg-white p-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={current?.id === item.id ? "location" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition [&_svg]:size-4 [&_svg]:shrink-0",
                    item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {item.icon}
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div data-settings-panels className="min-w-0 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function MobileSignOut() {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/sign-in" })}
      className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white text-[0.95rem] font-semibold text-red-600 shadow-[0_1px_3px_rgba(15,23,42,0.05)] active:bg-red-50"
    >
      <LogOut className="size-[18px]" /> Sign out
    </button>
  );
}
