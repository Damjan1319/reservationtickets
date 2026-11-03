import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/search-bar";
import { SearchFilterShell } from "@/components/search-filter-shell";
import { SearchResults, SearchResultsFallback } from "@/components/search-results";
import { VENUE_TYPES } from "@/lib/constants";
import {
  SEARCH_OCCASIONS,
  listCities,
  occasionFilter,
  parseSearchParams,
  searchHref,
  withOccasion,
  type SearchQuery,
} from "@/lib/search";
import { cn } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = parseSearchParams({
    city: str(raw.city),
    date: str(raw.date),
    guests: str(raw.guests),
    type: str(raw.type),
    kind: str(raw.kind),
    occasion: str(raw.occasion),
    sort: str(raw.sort),
    available: str(raw.available),
  });
  const [t, tv, tc, cities] = await Promise.all([
    getTranslations("search"),
    getTranslations("venue"),
    getTranslations("common"),
    listCities(),
  ]);
  const activeFilters =
    Number(Boolean(query.occasion)) +
    Number(Boolean(query.type)) +
    Number(query.available) +
    Number(query.sort !== "recommended");

  return (
    <div>
      <div className="sticky top-16 z-30 border-b border-line bg-bg/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <SearchBar key={searchHref(query)} cities={cities} values={query} compact />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-10">
        <SearchFilterShell key={searchHref(query)} title={t("filters")} closeLabel={tc("close")} activeCount={activeFilters}>
          <FilterForm query={query}>
            <fieldset className="mt-2 space-y-1">
              <legend className="mb-2 text-[13px] font-semibold text-paper-text">{t("occasion")}</legend>
              <FilterLink query={query} patch={withOccasion(query, "")} active={!query.occasion && query.kind === "all"}>
                {t("occasionAny")}
              </FilterLink>
              {SEARCH_OCCASIONS.map((item) => (
                <FilterLink
                  key={item}
                  query={query}
                  patch={withOccasion(query, item)}
                  active={query.occasion === item || (item === "EVENTS" && query.kind === "event" && !query.occasion)}
                >
                  {t(`occasions.${item}`)}
                </FilterLink>
              ))}
            </fieldset>

            <fieldset className="mt-6 space-y-1">
              <legend className="mb-2 text-[13px] font-semibold text-paper-text">{tv("type")}</legend>
              <FilterLink query={query} patch={{ type: "" }} active={!query.type}>
                {tc("allTypes")}
              </FilterLink>
              {(occasionFilter(query.occasion)?.types ?? VENUE_TYPES).map((item) => (
                <FilterLink key={item} query={query} patch={{ type: item }} active={query.type === item}>
                  {tv(`types.${item}`)}
                </FilterLink>
              ))}
            </fieldset>

            <label className="mt-6 flex items-center gap-2.5 text-sm font-medium">
              <input type="checkbox" name="available" value="1" defaultChecked={query.available} className="size-4 accent-current" />
              {t("availableOnly")}
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-[13px] font-semibold text-paper-text">{t("sort")}</span>
              <select
                name="sort"
                defaultValue={query.sort}
                className="w-full rounded-lg border border-paper-line px-3 py-2 text-sm font-medium"
              >
                <option value="recommended">{t("sorts.recommended")}</option>
                <option value="seats">{t("sorts.seats")}</option>
                <option value="events">{t("sorts.events")}</option>
              </select>
            </label>

            <button type="submit" className="btn btn-primary btn-full mt-5">
              {t("applyFilters")}
            </button>
          </FilterForm>
        </SearchFilterShell>

        <Suspense fallback={<SearchResultsFallback />}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  );
}

function str(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function FilterForm({ query, children }: { query: SearchQuery; children: ReactNode }) {
  return (
    <form action="/search" className="mt-1">
      <input type="hidden" name="city" value={query.city} />
      <input type="hidden" name="date" value={query.date} />
      <input type="hidden" name="guests" value={query.guests} />
      <input type="hidden" name="kind" value={query.kind} />
      {query.occasion ? <input type="hidden" name="occasion" value={query.occasion} /> : null}
      {query.type ? <input type="hidden" name="type" value={query.type} /> : null}
      {children}
    </form>
  );
}

function FilterLink({
  query,
  patch,
  active,
  children,
}: {
  query: SearchQuery;
  patch: Partial<SearchQuery>;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={searchHref({ ...query, ...patch })}
      className={cn(
        "flex min-h-10 items-center rounded-lg px-2.5 text-sm font-medium active:opacity-70",
        active ? "bg-surface-2 text-paper-text" : "text-paper-muted hover:text-paper-text",
      )}
    >
      {children}
    </Link>
  );
}
