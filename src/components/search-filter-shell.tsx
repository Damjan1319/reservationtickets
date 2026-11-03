"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/components/use-scroll-lock";

export function SearchFilterShell({
  title,
  closeLabel,
  activeCount,
  children,
}: {
  title: string;
  closeLabel: string;
  activeCount: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const media = window.matchMedia("(min-width: 1024px)");
    function onDesktop() {
      if (media.matches) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    media.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKey);
      media.removeEventListener("change", onDesktop);
    };
  }, [open]);

  const sheet =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="lg:hidden">
            <button
              type="button"
              className="fixed inset-0 z-50 bg-black/40"
              aria-label={closeLabel}
              onClick={() => setOpen(false)}
            />
            <aside
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[min(85dvh,40rem)] overflow-y-auto overscroll-contain rounded-t-2xl border border-paper-line bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-paper-text shadow-2xl"
              onScroll={() => {
                if (document.activeElement instanceof HTMLSelectElement) document.activeElement.blur();
              }}
              onChange={(event) => {
                if (event.target instanceof HTMLSelectElement) event.target.blur();
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{title}</p>
                <button type="button" className="text-sm font-semibold" onClick={() => setOpen(false)}>
                  {closeLabel}
                </button>
              </div>
              {children}
            </aside>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="lg:sticky lg:top-40 lg:h-fit">
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold lg:hidden"
        onClick={() => setOpen(true)}
      >
        {title}
        {activeCount > 0 ? (
          <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-xs text-bg">{activeCount}</span>
        ) : null}
      </button>
      {sheet}
      {open ? null : (
        <aside className="hidden text-paper-text lg:block">
          <p className="sr-only">{title}</p>
          {children}
        </aside>
      )}
    </div>
  );
}
