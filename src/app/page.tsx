import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HomeHero } from "@/components/home-hero";
import { SearchResultCard } from "@/components/search-result-card";
import { VENUE_TYPES } from "@/lib/constants";
import { listCities, listDestinations, parseSearchParams, searchHref, searchVenues } from "@/lib/search";
import { venueCover } from "@/lib/utils";

export default async function Home() {
  const t = await getTranslations("home");
  const ts = await getTranslations("search");
  const tv = await getTranslations("venue");
  const defaults = parseSearchParams({});
  const [cities, destinations, featured] = await Promise.all([
    listCities(),
    listDestinations(),
    searchVenues(defaults),
  ]);

  return (
    <div>
      <HomeHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        ctaVenue={t("ctaVenue")}
        cities={cities}
        searchDefaults={defaults}
      />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-6 sm:pt-12">
        <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{ts("browseTypes")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {VENUE_TYPES.filter((item) => item !== "BAR").map((type) => (
            <Link
              key={type}
              href={searchHref({ ...defaults, type })}
              className="group relative overflow-hidden rounded-2xl border border-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venueCover(type)}
                alt=""
                className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03] sm:h-52"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <p className="absolute bottom-4 left-4 text-xl font-bold text-cream">{tv(`types.${type}`)}</p>
            </Link>
          ))}
        </div>
      </section>

      {destinations.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{ts("destinations")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((item) => (
              <Link
                key={item.city}
                href={searchHref({ ...defaults, city: item.city })}
                className="group relative overflow-hidden rounded-2xl border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.cover}
                  alt=""
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-xl font-bold text-cream">{item.city}</p>
                  <p className="mt-0.5 text-sm font-medium text-cream/80">{ts("results", { count: item.count })}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="venues" className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{ts("popular")}</h2>
          <Link href="/search" className="text-sm font-semibold text-cream/75 hover:text-cream">
            {t("ctaGuest")}
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="mt-6 font-medium text-cream">{t("venuesEmpty")}</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {featured.slice(0, 6).map((venue) => (
              <SearchResultCard key={venue.id} venue={venue} query={defaults} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:pb-20">
        <p className="text-sm font-medium text-cream/70">{t("howTitle")}</p>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {[
            ["01", t("step1Title"), t("step1Body")],
            ["02", t("step2Title"), t("step2Body")],
            ["03", t("step3Title"), t("step3Body")],
          ].map(([num, title, body]) => (
            <div key={num}>
              <p className="text-xs font-semibold tracking-wide text-cream/45">{num}</p>
              <h2 className="mt-2 text-lg font-bold tracking-tight text-cream">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-cream/70">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
