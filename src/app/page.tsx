import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CityDestinations } from "@/components/city-destinations";
import { HomeHero } from "@/components/home-hero";
import { HomePicks } from "@/components/home-picks";
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

      <CityDestinations destinations={destinations} defaults={defaults} />

      <HomePicks
        goingOut={featured.filter((venue) => venue.hasEventOnDate).slice(0, 6)}
        sitDown={featured.filter((venue) => venue.type === "RESTAURANT" || venue.type === "CAFE").slice(0, 6)}
        query={defaults}
      />

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
