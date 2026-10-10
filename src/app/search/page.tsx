import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchBar } from "@/components/search-bar";
import { SearchResultCard } from "@/components/search-result-card";
import { VENUE_TYPES } from "@/lib/constants";
import { listCities, parseSearchParams, searchHref, searchVenues, type SearchQuery } from "@/lib/search";
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
    sort: str(raw.sort),
    available: str(raw.available),
  });
  const [t, tv, tc, cities, venues] = await Promise.all([
    getTranslations("search"),
    getTranslations("venue"),
    getTranslations("common"),
    listCities(),
    searchVenues(query),
  ]);

  return (
    <div>
      <div className="sticky top-[52px] z-30 border-b border-line/50 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <SearchBar cities={cities} values={query} compact />
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr] lg:py-10">
        <aside className="h-fit rounded-2xl border border-paper-line bg-paper p-5 text-paper-text lg:sticky lg:top-36">
          <p className="text-sm font-bold">{t("filters")}</p>
          <FilterForm query={query}>
            <fieldset className="mt-4 space-y-2">
              <legend className="text-xs font-semibold uppercase tracking-wide text-paper-muted">{tv("type")}</legend>
              <FilterLink query={query} patch={{ type: "" }} active={!query.type}>
                {tc("allTypes")}
              </FilterLink>
              {VENUE_TYPES.filter((item) => item !== "BAR").map((item) => (
                <FilterLink key={item} query={query} patch={{ type: item }} active={query.type === item}>
                  {tv(`types.${item}`)}
                </FilterLink>
              ))}
            </fieldset>

            <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" name="available" value="1" defaultChecked={query.available} className="size-4" />
              {t("availableOnly")}
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-paper-muted">{t("sort")}</span>
              <select
                name="sort"
                defaultValue={query.sort}
                className="w-full rounded-xl border border-paper-line bg-white px-3 py-2 text-sm font-semibold"
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
        </aside>

        <section>
          <h1 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">
            {query.city ? t("resultsIn", { count: venues.length, city: query.city }) : t("results", { count: venues.length })}
          </h1>
          <p className="mt-2 text-sm font-medium text-cream/65">
            {query.date} · {t("guestsShort", { count: query.guests })}
          </p>

          {venues.length === 0 ? (
            <p className="mt-8 font-medium text-cream">{t("empty")}</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {venues.map((venue) => (
                <SearchResultCard key={venue.id} venue={venue} query={query} />
              ))}
            </div>
          )}
        </section>
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
        "block rounded-lg px-2 py-1.5 text-sm font-semibold",
        active ? "bg-paper-text text-paper" : "text-paper-text hover:bg-white",
      )}
    >
      {children}
    </Link>
  );
}
