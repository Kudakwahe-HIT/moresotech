"use client";

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown, ChevronUp, CircleAlert, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { id: string; text: string };

type ListInputProps = {
  /** Submitted as one item per line, so server-side parsing stays the same as a textarea. */
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string[];
  /** Shown in the "add" row, e.g. "Add an eligibility rule". */
  placeholder?: string;
  /** Example items shown as quick-add chips while the list is empty. */
  suggestions?: string[];
  max?: number;
  error?: string;
  /** Bullet style: round "radio" dots (default) or check marks. */
  variant?: "radio" | "check";
};

let counter = 0;
const newId = () => `item-${++counter}`;

/**
 * Editable list: each entry is its own row with a round bullet.
 * Enter adds, Backspace on an empty row removes, pasting several lines splits them into items.
 */
export function ListInput({ name, label, hint, defaultValue = [], placeholder = "Add an item", suggestions = [], max = 20, error, variant = "radio" }: ListInputProps) {
  const groupId = useId();
  const [items, setItems] = useState<Item[]>(() => defaultValue.map((text) => ({ id: newId(), text })));
  const [draft, setDraft] = useState("");
  const inputs = useRef(new Map<string, HTMLInputElement>());
  const addRef = useRef<HTMLInputElement>(null);
  const full = items.length >= max;

  const serialized = items.map((i) => i.text.trim()).filter(Boolean).join("\n");

  function focusItem(id: string | undefined, atEnd = true) {
    requestAnimationFrame(() => {
      const el = id ? inputs.current.get(id) : addRef.current;
      el?.focus();
      if (el && atEnd) el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  function addMany(texts: string[], focus = true) {
    const clean = texts.map((t) => t.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
    if (!clean.length) return;
    setItems((prev) => [...prev, ...clean.slice(0, Math.max(0, max - prev.length)).map((text) => ({ id: newId(), text }))]);
    if (focus) focusItem(undefined);
  }

  function update(id: string, text: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  }

  function remove(id: string) {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      focusItem(prev[index - 1]?.id ?? prev[index + 1]?.id);
      return prev.filter((i) => i.id !== id);
    });
  }

  function move(id: string, delta: -1 | 1) {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    focusItem(id);
  }

  function onItemKeyDown(event: KeyboardEvent<HTMLInputElement>, item: Item, index: number) {
    if (event.key === "Enter") {
      event.preventDefault();
      focusItem(items[index + 1]?.id);
    } else if (event.key === "Backspace" && item.text === "") {
      event.preventDefault();
      remove(item.id);
    } else if (event.key === "ArrowUp" && event.altKey) {
      event.preventDefault();
      move(item.id, -1);
    } else if (event.key === "ArrowDown" && event.altKey) {
      event.preventDefault();
      move(item.id, 1);
    }
  }

  function onAddKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addMany([draft]);
      setDraft("");
    } else if (event.key === "Backspace" && draft === "" && items.length) {
      event.preventDefault();
      focusItem(items[items.length - 1].id);
    }
  }

  function onAddPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (!/\r?\n/.test(text)) return;
    event.preventDefault();
    addMany(text.split(/\r?\n/));
    setDraft("");
  }

  const Bullet = ({ filled }: { filled: boolean }) =>
    variant === "check" ? (
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition", filled ? "border-emerald-500 bg-emerald-500" : "border-slate-300")}>
        {filled && (
          <svg viewBox="0 0 12 12" className="size-3 text-white" aria-hidden>
            <path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    ) : (
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition", filled ? "border-brand-blue" : "border-slate-300")}>
        {filled && <span className="size-2 rounded-full bg-brand-blue" />}
      </span>
    );

  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend className="mb-1.5 flex w-full items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-slate-700">
          {label}
          {hint && <span className="ml-2 font-normal text-slate-400">{hint}</span>}
        </span>
        <span className="text-xs text-slate-400">
          {items.length}/{max}
        </span>
      </legend>

      <input type="hidden" name={name} value={serialized} />

      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="group flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white pl-3.5 pr-1.5 transition focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 hover:border-slate-300"
            >
              <Bullet filled={item.text.trim().length > 0} />
              <input
                ref={(el) => {
                  if (el) inputs.current.set(item.id, el);
                  else inputs.current.delete(item.id);
                }}
                value={item.text}
                onChange={(e) => update(item.id, e.target.value)}
                onKeyDown={(e) => onItemKeyDown(e, item, index)}
                aria-label={`${label} item ${index + 1}`}
                maxLength={200}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
              />
              <span className="flex items-center opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                <RowButton label="Move up" disabled={index === 0} onClick={() => move(item.id, -1)}>
                  <ChevronUp className="size-4" />
                </RowButton>
                <RowButton label="Move down" disabled={index === items.length - 1} onClick={() => move(item.id, 1)}>
                  <ChevronDown className="size-4" />
                </RowButton>
                <RowButton label={`Remove "${item.text || "empty item"}"`} danger onClick={() => remove(item.id)}>
                  <X className="size-4" />
                </RowButton>
              </span>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <div className="flex h-11 items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 pl-3.5 pr-1.5 transition focus-within:border-brand-blue focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-blue/10 hover:border-slate-400">
          <Plus aria-hidden className="size-5 shrink-0 text-slate-400" />
          <input
            ref={addRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onAddKeyDown}
            onPaste={onAddPaste}
            onBlur={() => {
              // Don't lose a half-typed item when the admin clicks away.
              if (draft.trim()) {
                addMany([draft], false);
                setDraft("");
              }
            }}
            placeholder={placeholder}
            aria-label={`Add to ${label}`}
            maxLength={200}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {draft.trim() && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                addMany([draft]);
                setDraft("");
              }}
              className="h-8 shrink-0 rounded-lg bg-[#0f1b2d] px-3 text-xs font-semibold text-white transition hover:bg-[#1a2a42]"
            >
              Add
            </button>
          )}
        </div>
      )}

      {items.length === 0 && suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-xs text-slate-400">Try:</span>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addMany([s], false)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-blue/40 hover:text-brand-blue"
            >
              + {s}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <p id={`${groupId}-error`} className="flex items-center gap-1.5 text-[0.8rem] font-medium text-red-600">
          <CircleAlert className="size-3.5" /> {error}
        </p>
      ) : (
        <p className="text-xs text-slate-400">Press Enter to add · paste several lines at once · Backspace on an empty item removes it</p>
      )}
    </fieldset>
  );
}

function RowButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-slate-400 transition disabled:pointer-events-none disabled:opacity-30",
        danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-slate-100 hover:text-slate-700",
      )}
    >
      {children}
    </button>
  );
}
