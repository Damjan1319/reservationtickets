"use client";

import type { ReactNode } from "react";

export function AppDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/70 p-4 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-paper-line bg-paper p-5 text-paper-text shadow-lg sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
      >
        <h2 id="app-dialog-title" className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        {children ? <div className="mt-2 text-sm leading-relaxed text-paper-muted">{children}</div> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {cancelLabel ? (
            <button type="button" className="btn btn-ghost !px-4 !py-2" onClick={onCancel}>
              {cancelLabel}
            </button>
          ) : null}
          {confirmLabel ? (
            <button
              type="button"
              className={`btn btn-primary !px-4 !py-2 ${danger ? "bg-danger text-cream" : ""}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
