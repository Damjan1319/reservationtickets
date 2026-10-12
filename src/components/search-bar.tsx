"use client";

import { useTranslations } from "next-intl";
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

  return (
    <form action="/search" className={cn("search-bar", compact && "search-bar-compact")}>
      <div className={cn("search-bar-grid", compact ? "search-bar-grid-compact" : "search-bar-grid-home")}>
        <label className="search-field">
          <span className="search-label">{t("where")}</span>
          <input
            name="city"
            list="search-cities"
            defaultValue={values.city}
            placeholder={t("wherePlaceholder")}
            autoComplete="off"
            className="search-input"
          />
        </label>
        <datalist id="search-cities">
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
          <select name="occasion" defaultValue={values.occasion} className="search-input">
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
