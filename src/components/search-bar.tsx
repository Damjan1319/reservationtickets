"use client";

import { useTranslations } from "next-intl";
import { SEARCH_KINDS, type SearchQuery } from "@/lib/search";
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

  return (
    <form
      action="/search"
      className={cn(
        "rounded-2xl bg-paper p-2 text-paper-text shadow-[0_12px_40px_rgba(0,0,0,0.28)]",
        compact && "shadow-none ring-1 ring-paper-line",
      )}
    >
      <div
        className={cn(
          "grid gap-2",
          compact
            ? "lg:grid-cols-[1.4fr_1fr_0.7fr_1.1fr_auto]"
            : "md:grid-cols-[1.4fr_1fr_0.7fr_1.2fr_auto]",
        )}
      >
        <label className="rounded-xl bg-white px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-paper-muted">
            {t("where")}
          </span>
          <input
            name="city"
            list="search-cities"
            defaultValue={values.city}
            placeholder={t("wherePlaceholder")}
            autoComplete="off"
            className="search-plain mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-paper-text outline-none placeholder:font-medium placeholder:text-paper-muted/70"
          />
        </label>
        <datalist id="search-cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <label className="rounded-xl bg-white px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-paper-muted">
            {t("when")}
          </span>
          <input
            name="date"
            type="date"
            required
            min={todayKey()}
            defaultValue={values.date}
            className="search-plain mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-paper-text outline-none [color-scheme:light]"
          />
        </label>

        <label className="rounded-xl bg-white px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-paper-muted">
            {t("who")}
          </span>
          <input
            name="guests"
            type="number"
            min={1}
            max={20}
            defaultValue={values.guests}
            className="search-plain mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-paper-text outline-none [color-scheme:light]"
          />
        </label>

        <label className="rounded-xl bg-white px-4 py-2.5">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-paper-muted">
            {t("what")}
          </span>
          <select
            name="kind"
            defaultValue={values.kind}
            className="search-plain mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-semibold text-paper-text outline-none"
          >
            {SEARCH_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {t(`kinds.${kind}`)}
              </option>
            ))}
          </select>
        </label>

        {values.type ? <input type="hidden" name="type" value={values.type} /> : null}
        {values.sort !== "recommended" ? <input type="hidden" name="sort" value={values.sort} /> : null}
        {values.available ? <input type="hidden" name="available" value="1" /> : null}

        <button
          type="submit"
          className={cn(
            "btn btn-primary min-h-[3.4rem] px-6 text-base",
            compact ? "lg:min-h-full" : "md:min-h-full",
          )}
        >
          {tc("search")}
        </button>
      </div>
    </form>
  );
}
