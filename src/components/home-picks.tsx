import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { VenueTile } from "@/components/venue-tile";
import { searchHref, type SearchQuery, type SearchVenue } from "@/lib/search";
import { formatDateTime, formatMoney } from "@/lib/utils";

export async function HomePicks({
  goingOut,
  sitDown,
  query,
}: {
  goingOut: SearchVenue[];
  sitDown: SearchVenue[];
  query: SearchQuery;
}) {
  const [t, th, tv, tr, locale] = await Promise.all([
    getTranslations("search"),
    getTranslations("home"),
    getTranslations("venue"),
    getTranslations("review"),
    getLocale(),
  ]);
  const eventQuery: SearchQuery = { ...query, occasion: "EVENTS", kind: "event" };
  const tableQuery: SearchQuery = { ...query, kind: "table" };

  function eventStatus(venue: SearchVenue) {
    const next = venue.nextEvent;
    if (!next) return { status: t("noEvents"), statusTone: "muted" as const };
    const parts = [formatDateTime(new Date(next.startsAt), locale), t("eventLeft", { count: next.left })];
    if (next.price > 0) parts.push(t("fromPrice", { price: formatMoney(next.price, locale) }));
    return { status: parts.join(" · "), statusTone: next.left > 0 ? ("ok" as const) : ("bad" as const) };
  }

  function tableStatus(venue: SearchVenue) {
    if (venue.closed) return { status: t("closed"), statusTone: "bad" as const };
    if (venue.tableLeft == null) return { status: t("tableOpen"), statusTone: "ok" as const };
    return venue.bookableTable
      ? { status: t("tableLeft", { count: venue.tableLeft }), statusTone: "ok" as const }
      : { status: t("tableFull"), statusTone: "bad" as const };
  }

  const sections = [
    {
      key: "out",
      title: t("goingOut"),
      hint: t("goingOutHint"),
      empty: t("goingOutEmpty"),
      href: searchHref(eventQuery),
      venues: goingOut,
      query: eventQuery,
      status: eventStatus,
    },
    {
      key: "sit",
      title: t("sitDown"),
      hint: t("sitDownHint"),
      empty: t("sitDownEmpty"),
      href: searchHref(tableQuery),
      venues: sitDown,
      query: tableQuery,
      status: tableStatus,
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <section key={section.key} className="mx-auto max-w-6xl px-4 pb-16">
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-6">
            <div>
              <h2 className="text-xl font-semibold text-cream">{section.title}</h2>
              <p className="mt-1 text-sm text-muted">{section.hint}</p>
            </div>
            <Link href={section.href} className="shrink-0 text-sm font-medium text-muted hover:text-cream">
              {th("ctaGuest")} →
            </Link>
          </div>
          {section.venues.length === 0 ? (
            <p className="mt-6 text-sm text-muted">{section.empty}</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.venues.map((venue) => (
                <VenueTile
                  key={venue.id}
                  venue={venue}
                  query={section.query}
                  labels={{ type: tv(`types.${venue.type}`), reviews: tr("countLabel"), ...section.status(venue) }}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
