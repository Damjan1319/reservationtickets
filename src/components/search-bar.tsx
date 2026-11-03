"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useScrollLock } from "@/components/use-scroll-lock";
import { SEARCH_OCCASIONS, type SearchQuery } from "@/lib/search";
import { todayKey } from "@/lib/time";
import { cn } from "@/lib/utils";

export function SearchBar({
  cities,
  values,
  compact = false,
}: {
  cities: string[];
  values: SearchQuery;
  compact?: boolean;
}) {
  const t = useTranslations("search");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const summary = [
    values.city || t("wherePlaceholder"),
    values.date,
    t("guestsShort", { count: values.guests }),
    values.occasion ? t(`occasions.${values.occasion}`) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {compact ? (
        <button type="button" className="search-summary flex lg:hidden" onClick={() => setOpen(true)}>
          <span className="min-w-0 truncate">{summary}</span>
          <span className="shrink-0">{tc("search")}</span>
        </button>
      ) : null}

      <div className={cn(compact && "hidden lg:block")}>
        <SearchForm cities={cities} values={values} listId="search-cities" layout={compact ? "compact" : "home"} />
      </div>

      {compact && open && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/55"
                aria-label={tc("close")}
                onClick={() => setOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[min(92dvh,44rem)] overflow-y-auto overscroll-contain rounded-t-2xl bg-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
                <div className="mb-3 flex items-center justify-between text-cream">
                  <p className="font-semibold">{tc("search")}</p>
                  <button type="button" className="text-sm font-semibold" onClick={() => setOpen(false)}>
                    {tc("close")}
                  </button>
                </div>
                <SearchForm
                  cities={cities}
                  values={values}
                  listId="search-cities-sheet"
                  layout="stack"
                  onSubmit={() => setOpen(false)}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function SearchForm({
  cities,
  values,
  listId,
  layout,
  onSubmit,
}: {
  cities: string[];
  values: SearchQuery;
  listId: string;
  layout: "home" | "compact" | "stack";
  onSubmit?: () => void;
}) {
  const t = useTranslations("search");
  const tc = useTranslations("common");

  return (
    <form action="/search" className={cn("search-bar", layout === "compact" && "search-bar-compact")} onSubmit={onSubmit}>
      <div
        className={cn(
          "search-bar-grid",
          layout === "home" && "search-bar-grid-home",
          layout === "compact" && "search-bar-grid-compact",
        )}
      >
        <label className="search-field">
          <span className="search-label">{t("where")}</span>
          <input
            name="city"
            list={listId}
            defaultValue={values.city}
            placeholder={t("wherePlaceholder")}
            autoComplete="off"
            enterKeyHint="search"
            className="search-input"
          />
        </label>
        <datalist id={listId}>
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <label className="search-field">
          <span className="search-label">{t("when")}</span>
          <input
            name="date"
            type="date"
            required
            min={todayKey()}
            defaultValue={values.date}
            className="search-input"
          />
        </label>

        <label className="search-field">
          <span className="search-label">{t("who")}</span>
          <input
            name="guests"
            type="number"
            min={1}
            max={20}
            defaultValue={values.guests}
            className="search-input"
          />
        </label>

        <label className="search-field">
          <span className="search-label">{t("occasion")}</span>
          <select
            name="occasion"
            defaultValue={values.occasion}
            className="search-input"
            onChange={(event) => event.currentTarget.blur()}
          >
            <option value="">{t("occasionAny")}</option>
            {SEARCH_OCCASIONS.map((item) => (
              <option key={item} value={item}>
                {t(`occasions.${item}`)}
              </option>
            ))}
          </select>
        </label>

        {!values.occasion && values.kind !== "all" ? <input type="hidden" name="kind" value={values.kind} /> : null}
        {values.type ? <input type="hidden" name="type" value={values.type} /> : null}
        {values.sort !== "recommended" ? <input type="hidden" name="sort" value={values.sort} /> : null}
        {values.available ? <input type="hidden" name="available" value="1" /> : null}

        <button type="submit" className="search-submit">
          {tc("search")}
        </button>
      </div>
    </form>
  );
}
