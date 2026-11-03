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
        ctaVenueLink={t("ctaVenueLink")}
        card={{ status: t("heroCardStatus"), title: t("heroCardTitle"), meta: t("heroCardMeta") }}
        cities={cities}
        searchDefaults={defaults}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="border-t border-line pt-6">
          <h2 className="text-xl font-semibold text-cream">{ts("browseTypes")}</h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {VENUE_TYPES.filter((item) => item !== "BAR").map((type) => (
            <Link
              key={type}
              href={searchHref({ ...defaults, type })}
              prefetch
              className="group flex items-center gap-4 rounded-xl border border-line p-3 pr-4 transition hover:border-cream/25"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venueCover(type)}
                alt=""
                decoding="async"
                className="h-16 w-16 shrink-0 rounded-lg bg-surface-2 object-cover saturate-[.8]"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-cream">{tv(`types.${type}`)}</span>
                <span className="mt-0.5 block truncate text-[13px] text-muted">{t(`typeHints.${type}`)}</span>
              </span>
              <span aria-hidden className="text-muted transition group-hover:translate-x-0.5 group-hover:text-cream">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <HomePicks
        goingOut={featured.filter((venue) => venue.hasEventOnDate).slice(0, 6)}
        sitDown={featured.filter((venue) => venue.type === "RESTAURANT" || venue.type === "CAFE").slice(0, 6)}
        query={defaults}
      />

      <CityDestinations destinations={destinations} defaults={defaults} />

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="border-t border-line pt-6">
          <h2 className="text-xl font-semibold text-cream">{t("howTitle")}</h2>
        </div>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {[
            ["1", t("step1Title"), t("step1Body")],
            ["2", t("step2Title"), t("step2Body")],
            ["3", t("step3Title"), t("step3Body")],
          ].map(([num, title, body]) => (
            <div key={num}>
              <p className="text-[13px] font-semibold text-muted">{num}</p>
              <h3 className="mt-2 text-base font-semibold text-cream">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:pb-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-surface-2/70 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-semibold text-cream">{t("venueBoxTitle")}</h2>
            <p className="mt-2 text-[15px] text-muted">{t("venueBoxBody")}</p>
          </div>
          <Link href="/register-venue" className="btn btn-primary shrink-0 !px-5 !py-3 !text-[15px]">
            {t("venueBoxCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}
