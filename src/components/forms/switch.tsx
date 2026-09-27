"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Also submitted with a form as "on" when checked (like a checkbox). */
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

/** On/off switch. Accessible as role="switch"; can be controlled or submitted with a form. */
export function Switch({ checked, onCheckedChange, disabled, name, ...aria }: SwitchProps) {
  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        {...aria}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-60",
          checked ? "bg-brand-blue" : "bg-slate-300",
        )}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-[1.375rem]" : "translate-x-0.5")} />
      </button>
      {name && checked && <input type="hidden" name={name} value="on" />}
    </>
  );
}
