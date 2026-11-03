import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CityDestinations } from "@/components/city-destinations";
import { HomeHero } from "@/components/home-hero";
import { HomePicks } from "@/components/home-picks";
import {
  SEARCH_OCCASIONS,
  listCities,
  listDestinations,
  parseSearchParams,
  searchHref,
  searchVenues,
  withOccasion,
} from "@/lib/search";

const GUEST_POINTS = ["0", "1", "2"] as const;
const VENUE_POINTS = ["0", "1", "2", "3"] as const;

export default async function Home() {
  const t = await getTranslations("home");
  const ts = await getTranslations("search");
  const defaults = parseSearchParams({});
  const [cities, destinations, featured] = await Promise.all([
    listCities(),
    listDestinations(),
    searchVenues(defaults),
  ]);

  const quickLinks = SEARCH_OCCASIONS.map((occasion) => ({
    label: ts(`occasions.${occasion}`),
    href: searchHref({ ...defaults, ...withOccasion(defaults, occasion) }),
  }));

  return (
    <div>
      <HomeHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        ctaVenue={t("ctaVenue")}
        ctaVenueLink={t("ctaVenueLink")}
        card={{ status: t("heroCardStatus"), title: t("heroCardTitle"), meta: t("heroCardMeta") }}
        quickTitle={t("quickTitle")}
        quickLinks={quickLinks}
        cities={cities}
        searchDefaults={defaults}
      />

      <HomePicks
        goingOut={featured.filter((venue) => venue.hasEventOnDate).slice(0, 6)}
        sitDown={featured.filter((venue) => venue.type === "RESTAURANT" || venue.type === "CAFE").slice(0, 6)}
        query={defaults}
      />

      <CityDestinations destinations={destinations} defaults={defaults} />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:pb-24">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-line p-7 sm:p-9">
            <h2 className="text-2xl font-semibold text-cream">{t("guestsTitle")}</h2>
            <p className="mt-1.5 text-[15px] text-muted">{t("guestsSubtitle")}</p>
            <ul className="mt-7 space-y-5">
              {GUEST_POINTS.map((key) => (
                <Point key={key} title={t(`guestPoints.${key}.title`)} body={t(`guestPoints.${key}.body`)} />
              ))}
            </ul>
            <Link href={searchHref(defaults)} className="btn btn-ghost mt-8">
              {t("ctaGuest")}
            </Link>
          </div>

          <div className="rounded-2xl bg-surface-2/70 p-7 sm:p-9">
            <h2 className="text-2xl font-semibold text-cream">{t("venuesTitle2")}</h2>
            <p className="mt-1.5 text-[15px] text-muted">{t("venuesSubtitle")}</p>
            <ul className="mt-7 grid gap-5 sm:grid-cols-2">
              {VENUE_POINTS.map((key) => (
                <Point key={key} title={t(`venuePoints.${key}.title`)} body={t(`venuePoints.${key}.body`)} />
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link href="/register-venue" className="btn btn-primary">
                {t("venuesCta")}
              </Link>
              <p className="text-[13px] text-muted">{t("venuesFree")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <svg
        viewBox="0 0 20 20"
        aria-hidden
        className="mt-0.5 h-5 w-5 shrink-0 text-cream"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 10.5 3.2 3.2L15 7" />
      </svg>
      <span>
        <span className="block text-[15px] font-semibold text-cream">{title}</span>
        <span className="mt-0.5 block text-sm leading-relaxed text-muted">{body}</span>
      </span>
    </li>
  );
}
