import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { type SearchQuery, searchHref } from "@/lib/search";

type City = { city: string; count: number; cover: string };

const FEATURED = 6;

export async function CityDestinations({
  destinations,
  defaults,
}: {
  destinations: City[];
  defaults: SearchQuery;
}) {
  const t = await getTranslations("search");
  if (destinations.length === 0) return null;

  const featured = destinations.slice(0, FEATURED);
  const rest = destinations
    .slice(FEATURED)
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city, "sr"));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h2 className="text-2xl font-bold tracking-normal text-cream sm:text-3xl">{t("destinations")}</h2>
      <p className="mt-2 max-w-xl text-sm font-medium leading-6 tracking-normal text-cream/70">
        {t("destinationsHint")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <Link
            key={item.city}
            href={searchHref({ ...defaults, city: item.city })}
            className="flex items-center gap-3 rounded-2xl border border-paper-line bg-paper p-3 text-paper-text transition hover:border-paper-text/35"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold tracking-normal">{item.city}</p>
              <p className="mt-0.5 text-sm font-medium tracking-normal text-paper-muted">
                {t("results", { count: item.count })}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="mt-5">
          <p className="text-sm font-semibold tracking-normal text-cream/70">{t("moreCities")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {rest.map((item) => (
              <Link
                key={item.city}
                href={searchHref({ ...defaults, city: item.city })}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold tracking-normal text-cream/90 hover:bg-surface-2 hover:text-cream"
              >
                {item.city}
                <span className="ml-1.5 font-medium text-cream/55">{item.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
