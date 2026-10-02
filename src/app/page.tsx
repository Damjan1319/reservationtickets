import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { HomeHero } from "@/components/home-hero";
import { VenueCard } from "@/components/venue-card";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const t = await getTranslations("home");
  const { city } = await searchParams;
  const cities = await prisma.venue.findMany({
    where: { verificationStatus: "VERIFIED" },
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  const venues = await prisma.venue.findMany({
    where: { verificationStatus: "VERIFIED", ...(city ? { city } : {}) },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <HomeHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        ctaGuest={t("ctaGuest")}
        ctaVenue={t("ctaVenue")}
      />

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <p className="text-sm text-muted">{t("howTitle")}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["01", t("step1Title"), t("step1Body")],
            ["02", t("step2Title"), t("step2Body")],
            ["03", t("step3Title"), t("step3Body")],
          ].map(([num, title, body]) => (
            <div
              key={num}
              className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6"
            >
              <p className="text-sm text-paper-muted">{num}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="venues" className="mx-auto max-w-6xl px-4 py-14 sm:pb-20">
        <h2 className="text-2xl font-semibold tracking-tight">{t("venuesTitle")}</h2>
        <CityFilter cities={cities.map((item) => item.city)} selected={city} />
        {venues.length === 0 ? (
          <p className="mt-10 text-muted">{t("venuesEmpty")}</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} {...venue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function CityFilter({ cities, selected }: { cities: string[]; selected?: string }) {
  const t = await getTranslations("common");

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link
        href="/"
        className={cn(
          "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
          !selected ? "bg-paper text-paper-text" : "border border-line text-muted hover:text-cream",
        )}
      >
        {t("allCities")}
      </Link>
      {cities.map((city) => (
        <Link
          key={city}
          href={`/?city=${encodeURIComponent(city)}`}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
            selected === city ? "bg-paper text-paper-text" : "border border-line text-muted hover:text-cream",
          )}
        >
          {city}
        </Link>
      ))}
    </div>
  );
}
