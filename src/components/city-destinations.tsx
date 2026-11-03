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
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="border-t border-line pt-6">
        <h2 className="text-xl font-semibold text-cream">{t("destinations")}</h2>
        <p className="mt-1 text-sm text-muted">{t("destinationsHint")}</p>
      </div>

      <div className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((item) => (
          <Link
            key={item.city}
            href={searchHref({ ...defaults, city: item.city })}
            className="flex items-center gap-3 border-b border-line py-3 transition hover:text-cream"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.cover} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-surface-2 object-cover" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-cream">{item.city}</span>
            <span className="shrink-0 text-sm text-muted">{t("results", { count: item.count })}</span>
          </Link>
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-medium text-muted">{t("moreCities")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {rest.map((item) => (
              <Link
                key={item.city}
                href={searchHref({ ...defaults, city: item.city })}
                className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-cream hover:border-cream/30"
              >
                {item.city}
                <span className="ml-1.5 text-muted">{item.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
