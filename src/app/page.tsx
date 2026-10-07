import { getTranslations } from "next-intl/server";
import { HomeHero } from "@/components/home-hero";
import { VenueBrowser } from "@/components/venue-browser";
import { prisma } from "@/lib/prisma";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; type?: string }>;
}) {
  const t = await getTranslations("home");
  const { city, type } = await searchParams;
  const venues = await prisma.venue.findMany({
    where: { verificationStatus: "VERIFIED" },
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

      <section id="venues" className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:pt-10 sm:pb-16">
        <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{t("venuesTitle")}</h2>
        <VenueBrowser
          venues={venues.map((venue) => ({
            id: venue.id,
            name: venue.name,
            slug: venue.slug,
            type: venue.type,
            city: venue.city,
            coverUrl: venue.coverUrl,
          }))}
          initialCity={city ?? ""}
          initialType={type ?? ""}
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-2 sm:pb-20">
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
