"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarCard() {
  const [today] = useState(() => new Date());
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Always 6 rows so the card height doesn't jump between months.
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1;
    if (day < 1) return { day: daysInPrevMonth + day, current: false };
    if (day > daysInMonth) return { day: day - daysInMonth, current: false };
    return { day, current: true };
  });

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const monthLabel = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between">
        <NavButton label="Previous month" onClick={() => setView(new Date(year, month - 1, 1))}>
          <ChevronLeft className="size-4" />
        </NavButton>
        <p className="text-sm font-bold text-slate-900" aria-live="polite">
          {monthLabel}
        </p>
        <NavButton label="Next month" onClick={() => setView(new Date(year, month + 1, 1))}>
          <ChevronRight className="size-4" />
        </NavButton>
      </div>

      <div className="mt-4 grid grid-cols-7 rounded-xl bg-slate-100/80 py-2 text-center text-xs font-semibold text-slate-500">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[0.8rem]">
        {cells.map((cell, i) => (
          <span
            key={i}
            aria-current={cell.current && isToday(cell.day) ? "date" : undefined}
            className={cn(
              "mx-auto flex size-8 items-center justify-center rounded-full",
              !cell.current && "text-slate-300",
              cell.current && "font-medium text-slate-700",
              cell.current && isToday(cell.day) && "bg-brand-orange font-bold text-white shadow-[0_6px_14px_-6px_rgba(245,130,32,0.8)]",
            )}
          >
            {cell.day}
          </span>
        ))}
      </div>
    </div>
  );
}

function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      {children}
    </button>
  );
}
