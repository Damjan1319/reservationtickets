import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchResultCard } from "@/components/search-result-card";
import { searchHref, type SearchQuery, type SearchVenue } from "@/lib/search";

export async function HomePicks({
  goingOut,
  sitDown,
  query,
}: {
  goingOut: SearchVenue[];
  sitDown: SearchVenue[];
  query: SearchQuery;
}) {
  const t = await getTranslations("search");
  const th = await getTranslations("home");

  return (
    <>
      <section id="venues" className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-cream sm:text-3xl">{t("goingOut")}</h2>
            <p className="mt-2 text-sm font-medium tracking-normal text-cream/70">{t("goingOutHint")}</p>
          </div>
          <Link href={searchHref({ ...query, occasion: "NIGHT", kind: "event" })} className="text-sm font-semibold text-cream/75 hover:text-cream">
            {th("ctaGuest")}
          </Link>
        </div>
        {goingOut.length === 0 ? (
          <p className="mt-6 font-medium text-cream/80">{t("goingOutEmpty")}</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {goingOut.map((venue) => (
              <SearchResultCard key={venue.id} venue={venue} query={{ ...query, occasion: "NIGHT", kind: "event" }} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:pb-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-normal text-cream sm:text-3xl">{t("sitDown")}</h2>
            <p className="mt-2 text-sm font-medium tracking-normal text-cream/70">{t("sitDownHint")}</p>
          </div>
          <Link href={searchHref({ ...query, kind: "table" })} className="text-sm font-semibold text-cream/75 hover:text-cream">
            {th("ctaGuest")}
          </Link>
        </div>
        {sitDown.length === 0 ? (
          <p className="mt-6 font-medium text-cream/80">{t("sitDownEmpty")}</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {sitDown.map((venue) => (
              <SearchResultCard key={venue.id} venue={venue} query={{ ...query, kind: "table" }} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
