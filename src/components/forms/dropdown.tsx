"use client";

import type { ReactNode } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type DropdownOption = {
  value: string;
  label: string;
  /** Optional second line in the menu, e.g. what a status means. */
  description?: string;
  icon?: ReactNode;
};

type DropdownProps = {
  options: DropdownOption[];
  /** Controlled value. Omit and use `defaultValue` for forms. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Submitted with the form under this name. */
  name?: string;
  id?: string;
  placeholder?: string;
  /** Screen-reader label when there's no visible <label>. */
  "aria-label"?: string;
  invalid?: boolean;
  /** `soft`: grey fill for toolbars. `outline`: bordered, for forms. */
  variant?: "soft" | "outline";
  /** Leading icon inside the trigger. */
  icon?: ReactNode;
  /** Soft variant only: tint the trigger to show a filter is applied. */
  active?: boolean;
  className?: string;
};

/** Branded select menu: keyboard + screen-reader friendly (Base UI), checkmark on the chosen item. */
export function Dropdown({
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  id,
  placeholder = "Select…",
  invalid,
  variant = "outline",
  icon,
  active = false,
  className,
  ...rest
}: DropdownProps) {
  const items = Object.fromEntries(options.map((o) => [o.value, o.label]));
  const isActive = variant === "soft" && active;

  return (
    <Select.Root
      items={items}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.((v as string | null) ?? "")}
    >
      <Select.Trigger
        id={id}
        aria-label={rest["aria-label"]}
        aria-invalid={invalid || undefined}
        className={cn(
          "group flex h-11 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-3.5 text-left text-sm outline-none transition",
          "focus-visible:ring-4 data-[popup-open]:ring-4",
          variant === "soft"
            ? cn(
                "rounded-2xl font-medium",
                isActive
                  ? "bg-brand-blue/[0.07] text-brand-blue ring-1 ring-brand-blue/20 focus-visible:ring-brand-blue/15 data-[popup-open]:ring-brand-blue/15"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 focus-visible:ring-brand-blue/10 data-[popup-open]:bg-white data-[popup-open]:ring-brand-blue/10",
              )
            : cn(
                "border bg-white text-slate-900",
                invalid
                  ? "border-red-300 focus-visible:ring-red-500/10 data-[popup-open]:ring-red-500/10"
                  : "border-slate-200 hover:border-slate-300 focus-visible:border-brand-blue focus-visible:ring-brand-blue/10 data-[popup-open]:border-brand-blue data-[popup-open]:ring-brand-blue/10",
              ),
          className,
        )}
      >
        {icon && <span className={cn("shrink-0", isActive ? "text-brand-blue" : "text-slate-400")}>{icon}</span>}
        <Select.Value
          placeholder={placeholder}
          className="min-w-0 flex-1 truncate data-[placeholder]:text-slate-400"
        />
        <Select.Icon className="shrink-0 text-slate-400 transition-transform duration-200 group-data-[popup-open]:rotate-180">
          <ChevronDown className="size-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Positioner sideOffset={8} alignItemWithTrigger={false} className="z-50 outline-none">
          <Select.Popup
            className={cn(
              "max-h-[min(var(--available-height),320px)] min-w-[var(--anchor-width)] origin-(--transform-origin) overflow-y-auto rounded-2xl bg-white p-1.5 outline-none",
              "shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5",
              "transition-[opacity,transform] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            )}
          >
            <Select.List>
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "group/item flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 text-sm text-slate-700 outline-none transition-colors",
                    option.description ? "py-2.5" : "h-10",
                    "data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 data-[selected]:font-semibold data-[selected]:text-brand-blue",
                  )}
                >
                  {option.icon && (
                    <span className="shrink-0 text-slate-400 group-data-[selected]/item:text-brand-blue">{option.icon}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <Select.ItemText className="block truncate">{option.label}</Select.ItemText>
                    {option.description && (
                      <span className="mt-0.5 block text-xs font-normal text-slate-500">{option.description}</span>
                    )}
                  </span>
                  <Select.ItemIndicator className="shrink-0 text-brand-blue">
                    <Check className="size-4" strokeWidth={2.5} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
