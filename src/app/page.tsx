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

      <section className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        <p className="text-sm font-medium text-cream">{t("howTitle")}</p>
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
              <p className="text-sm font-semibold text-paper-muted">{num}</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-paper-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="venues" className="mx-auto max-w-6xl px-4 py-14 sm:pb-20">
        <h2 className="text-3xl font-bold tracking-tight text-cream">{t("venuesTitle")}</h2>
        <VenueBrowser
          venues={venues.map((venue) => ({
            id: venue.id,
            name: venue.name,
            slug: venue.slug,
            type: venue.type,
            city: venue.city,
            description: venue.description,
            coverUrl: venue.coverUrl,
          }))}
          initialCity={city ?? ""}
          initialType={type ?? ""}
        />
      </section>
    </div>
  );
}
