import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsNavItem = { id: string; label: string; icon: LucideIcon; danger?: boolean };

/** Settings page frame: title, a sticky list of sections on wide screens, and the sections. */
export function SettingsLayout({ title, description, nav, children }: { title: string; description: string; nav: SettingsNavItem[]; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:flex-col lg:overflow-visible">
            {nav.map((item) => (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  className={cn(
                    "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                    item.danger ? "text-red-600 hover:bg-red-50" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">{children}</div>
      </div>
    </div>
  );
}

export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  danger,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-6 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7", danger && "ring-1 ring-red-100")}>
      <div className="flex items-start gap-3.5">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", danger ? "bg-red-50 text-red-600" : "bg-brand-blue/10 text-brand-blue")}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** A label/value line with an optional action, e.g. "Two-step verification · Off · Turn on". */
export function SettingsRow({ label, value, action }: { label: string; value: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <div className="mt-0.5 text-sm text-slate-500">{value}</div>
      </div>
      {action}
    </div>
  );
}
