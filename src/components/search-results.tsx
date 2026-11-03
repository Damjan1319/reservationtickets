import { getTranslations } from "next-intl/server";
import { SearchResultList } from "@/components/search-result-card";
import { searchVenues, type SearchQuery } from "@/lib/search";

export async function SearchResults({ query }: { query: SearchQuery }) {
  const [t, tv, venues] = await Promise.all([
    getTranslations("search"),
    getTranslations("venue"),
    searchVenues(query),
  ]);

  return (
    <section>
      <h1 className="text-[22px] font-semibold text-cream">
        {query.city ? t("resultsIn", { count: venues.length, city: query.city }) : t("results", { count: venues.length })}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {query.date} · {t("guestsShort", { count: query.guests })}
        {query.occasion ? ` · ${t(`occasions.${query.occasion}`)}` : ""}
        {query.type ? ` · ${tv(`types.${query.type}`)}` : ""}
      </p>

      {venues.length === 0 ? (
        <p className="mt-8 text-muted">{t("empty")}</p>
      ) : (
        <SearchResultList venues={venues} query={query} className="mt-6 border-b border-line" />
      )}
    </section>
  );
}

export function SearchResultsFallback() {
  return (
    <div className="mt-6 grid gap-4" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
      <div className="h-4 w-36 animate-pulse rounded-lg bg-surface" />
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  );
}
