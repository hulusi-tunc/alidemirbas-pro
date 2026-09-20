"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { clsx } from "@/lib/clsx";

/* THE FILTER MENU (2026-09-14, Hulusi: the channel and goal filters "need
   to have a custom dropdown and they need an icon to help the user
   choose"). A native select cannot draw an icon beside an option, so this
   is a listbox of the site's own: a trigger in the toolbar field's shape
   showing the current choice with its glyph, and a floating list where
   every option is a glyph tile and a label, the chosen one ticked.

   Keyboard: Enter, Space or Down opens and moves focus into the list;
   Up/Down walk it and wrap, Home/End jump, Enter or Space choose, Escape
   or Tab close and hand focus back to the trigger. A click outside
   closes. The list is `role="listbox"` with `aria-activedescendant`, so
   a screen reader hears the walked option, not the whole list. */

export type FilterOption = { id: string; label: string; icon: ReactNode };

export function FilterMenu({
  label,
  all,
  options,
  value,
  onChange,
  align = "start",
  className,
}: {
  /** The control's accessible name ("Channel", "Goal"). */
  label: string;
  /** The "any" choice, shown when nothing is picked. */
  all: { label: string; icon: ReactNode };
  options: readonly FilterOption[];
  /** The chosen option id, or "" for `all`. */
  value: string;
  onChange: (id: string) => void;
  /** Which edge of the trigger the list hangs from. The toolbar's menus
      sit at the right end of the row, so they hang from the right. */
  align?: "start" | "end";
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const idBase = useId();
  const [open, setOpen] = useState(false);
  const items: FilterOption[] = [{ id: "", label: all.label, icon: all.icon }, ...options];
  const selectedIndex = Math.max(0, items.findIndex((o) => o.id === value));
  const [active, setActive] = useState(selectedIndex);
  const current = items[selectedIndex];

  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  const choose = (i: number) => {
    onChange(items[i].id);
    close();
  };

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAt(selectedIndex);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAt(selectedIndex);
    }
  };
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const n = items.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div ref={root} className={clsx("relative w-full shrink-0 lg:w-52", className)}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? close(false) : openAt(selectedIndex))}
        onKeyDown={onTriggerKey}
        className={clsx(
          "flex h-11 w-full items-center gap-2.5 rounded-xl bg-paper pr-10 pl-3.5 text-left text-sm font-medium text-ink-800 ring-1 outline-none transition-shadow duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:ring-primary-400 [&>svg]:size-4 [&>svg]:shrink-0",
          value ? "ring-ink-950/[0.16] [&>svg]:text-ink-950" : "ring-ink-950/[0.08] [&>svg]:text-ink-500",
        )}
      >
        {current.icon}
        <span className="truncate">{current.label}</span>
      </button>
      <ChevronDown
        aria-hidden
        className={clsx(
          "pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-500 transition-transform duration-[var(--duration-fast)]",
          open && "rotate-180",
        )}
      />
      {open ? (
        <ul
          ref={list}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${idBase}-${active}`}
          onKeyDown={onListKey}
          className={clsx(
            "absolute top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl bg-paper p-1.5 shadow-[0_24px_60px_-24px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.08] outline-none",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {items.map((o, i) => (
            <li
              key={o.id || "all"}
              id={`${idBase}-${i}`}
              role="option"
              aria-selected={o.id === value}
              onClick={() => choose(i)}
              onMouseEnter={() => setActive(i)}
              className={clsx(
                "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm",
                i === active ? "bg-paper-soft text-ink-950" : "text-ink-700",
                o.id === value && "font-medium text-ink-950",
              )}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-paper-soft text-ink-600 [&>svg]:size-4">{o.icon}</span>
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.id === value ? <Check aria-hidden className="size-4 shrink-0 text-primary-600" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
