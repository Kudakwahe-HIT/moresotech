"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Shows a date/time in the viewer's own timezone (students join from many countries).
 * The server renders a UTC fallback; the browser swaps in local time after hydration.
 */
export function LocalTime({ iso, format = "full" }: { iso: string; format?: "full" | "date" | "time" }) {
  const text = useSyncExternalStore(
    noopSubscribe,
    () => fmt(iso, format),
    () => `${fmt(iso, format, "UTC")} UTC`,
  );
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}

function fmt(iso: string, format: "full" | "date" | "time", timeZone?: string) {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions =
    format === "date"
      ? { weekday: "short", day: "numeric", month: "short", timeZone }
      : format === "time"
        ? { hour: "2-digit", minute: "2-digit", timeZoneName: "short", timeZone }
        : { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short", timeZone };
  return d.toLocaleString("en-GB", opts);
}

// A shared clock that ticks every 30 s; snapshots are rounded so they stay stable between ticks.
const TICK = 30_000;
function subscribeClock(onChange: () => void) {
  const id = setInterval(onChange, TICK);
  return () => clearInterval(id);
}
const clockSnapshot = () => Math.floor(Date.now() / TICK) * TICK;

/** Live "Starts in 2d 4h" / "Live now" label. */
export function Countdown({ iso, durationMinutes }: { iso: string; durationMinutes: number }) {
  const now = useSyncExternalStore(subscribeClock, clockSnapshot, () => null);
  if (now === null) return <span className="opacity-0">…</span>;

  const start = new Date(iso).getTime();
  const end = start + durationMinutes * 60_000;
  if (now >= start && now <= end) {
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-red-600">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-red-500" />
        </span>
        Live now
      </span>
    );
  }
  if (now > end) return <span>Ended</span>;

  const mins = Math.max(1, Math.round((start - now) / 60_000));
  const d = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const label = d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m} min`;
  return <span>Starts in {label}</span>;
}
