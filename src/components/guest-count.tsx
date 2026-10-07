"use client";

import { MAX_GUESTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GuestCount({
  value,
  onChange,
  max = MAX_GUESTS,
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
}) {
  const limit = Math.max(1, Math.min(MAX_GUESTS, max));

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-11 w-11 rounded-full border border-paper-line bg-white text-xl font-semibold text-paper-text hover:border-paper-text"
        aria-label="-"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={limit}
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (!Number.isFinite(next)) return;
          onChange(Math.min(limit, Math.max(1, Math.floor(next))));
        }}
        className="h-11 w-20 rounded-xl border border-paper-line bg-white text-center text-lg font-semibold text-paper-text outline-none focus:border-paper-text"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(limit, value + 1))}
        className="h-11 w-11 rounded-full border border-paper-line bg-white text-xl font-semibold text-paper-text hover:border-paper-text"
        aria-label="+"
      >
        +
      </button>
      <div className="hidden flex-wrap gap-1 sm:flex">
        {[2, 4, 6, 8, 12].filter((count) => count <= limit).map((count) => (
          <button
            key={count}
            type="button"
            onClick={() => onChange(count)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-semibold",
              value === count
                ? "border-paper-text bg-paper-text text-paper"
                : "border-paper-line text-paper-text hover:border-paper-text",
            )}
          >
            {count}
          </button>
        ))}
      </div>
    </div>
  );
}
