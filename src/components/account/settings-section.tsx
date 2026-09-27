import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One settings section. On phones it's shown on its own screen (see SettingsLayout), where the top
 * bar already names it, so only the description is repeated.
 */
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
    <section
      id={id}
      data-settings-section
      className={cn("scroll-mt-6 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-7 lg:rounded-3xl", danger && "ring-1 ring-red-100")}
    >
      <div className="flex items-start gap-3.5">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl max-lg:hidden", danger ? "bg-red-50 text-red-600" : "bg-brand-blue/10 text-brand-blue")}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 max-lg:hidden">{title}</h3>
          {description && <p className="text-sm text-slate-500 lg:mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="mt-5 lg:mt-6">{children}</div>
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
