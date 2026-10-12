import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { isEventIntent, isTableIntent, resultHref, type SearchQuery, type SearchVenue } from "@/lib/search";
import { RatingBadge } from "@/components/review-form";
import { formatDateTime, formatMoney } from "@/lib/utils";

export async function SearchResultCard({
  venue,
  query,
}: {
  venue: SearchVenue;
  query: SearchQuery;
}) {
  const t = await getTranslations("search");
  const tv = await getTranslations("venue");
  const tr = await getTranslations("review");
  const locale = await getLocale();
  const href = resultHref(venue, query);
  const eventMode = isEventIntent(query);
  const tableMode = isTableIntent(query);
  const cta = eventMode ? t("takeTicket") : tableMode ? t("seeMenu") : t("seeVenue");

  return (
    <article className="overflow-hidden rounded-2xl border border-paper-line bg-paper text-paper-text md:grid md:grid-cols-[220px_1fr_200px]">
      <Link href={href} className="relative block h-48 md:h-full md:min-h-[11.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venue.coverUrl} alt="" className="h-full w-full object-cover" />
      </Link>

      <div className="flex flex-col justify-between p-5">
        <div>
          <p className="text-xs font-semibold text-paper-muted">
            {tv(`types.${venue.type}`)} · {venue.city}
            {venue.hasMenu && !eventMode ? ` · ${t("hasMenu")}` : ""}
          </p>
          {venue.promoTitle ? (
            <p className="mt-2 inline-flex rounded-full bg-paper-text px-2.5 py-1 text-xs font-semibold text-paper">
              {venue.promoTitle}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            <Link href={href} className="hover:underline">
              {venue.name}
            </Link>
          </h2>
          <div className="mt-2">
            <RatingBadge overall={venue.ratingAvg} count={venue.ratingCount} label={tr("countLabel")} />
          </div>
          {venue.address && venue.address !== venue.city ? (
            <p className="mt-1 text-sm font-medium text-paper-muted">{venue.address}</p>
          ) : null}
          {venue.description && !eventMode ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-paper-muted">{venue.description}</p>
          ) : null}
          {eventMode && venue.events.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {venue.events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/v/${venue.slug}/events/${event.id}?guests=${query.guests}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {event.title}
                    <span className="mt-0.5 block font-medium text-paper-muted">
                      {formatDateTime(new Date(event.startsAt), locale)}
                      {event.price > 0 ? ` · ${formatMoney(event.price, locale)}` : ""}
                      {` · ${t("eventLeft", { count: event.left })}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {!eventMode ? (
          <p className="mt-4 text-sm font-medium text-paper-muted">
            {t("hours", { opens: venue.opensAt, closes: venue.closesAt })}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col justify-between border-t border-paper-line p-5 md:border-l md:border-t-0">
        <div className="space-y-1.5 text-sm font-semibold">
          {eventMode ? (
            venue.nextEvent ? (
              <>
                <p>
                  {t("eventLeft", { count: venue.nextEvent.left })}
                  {venue.nextEvent.price > 0
                    ? ` · ${t("fromPrice", { price: formatMoney(venue.nextEvent.price, locale) })}`
                    : null}
                </p>
                <p className="font-medium text-paper-muted">
                  {formatDateTime(new Date(venue.nextEvent.startsAt), locale)}
                </p>
              </>
            ) : (
              <p className="font-medium text-paper-muted">{t("noEvents")}</p>
            )
          ) : (
            <>
              {venue.closed ? (
                <p className="text-danger">{t("closed")}</p>
              ) : venue.tableLeft != null ? (
                <p className={venue.bookableTable ? "text-paper-text" : "text-danger"}>
                  {venue.bookableTable ? t("tableLeft", { count: venue.tableLeft }) : t("tableFull")}
                </p>
              ) : (
                <p>{t("tableOpen")}</p>
              )}
              {!tableMode && venue.nextEvent ? (
                <p className="font-medium text-paper-muted">
                  {t("eventLeft", { count: venue.nextEvent.left })}
                  {venue.nextEvent.price > 0
                    ? ` · ${t("fromPrice", { price: formatMoney(venue.nextEvent.price, locale) })}`
                    : null}
                </p>
              ) : null}
            </>
          )}
        </div>
        <div className="mt-4">
          <Link href={href} className="btn btn-primary btn-full">
            {cta}
          </Link>
        </div>
      </div>
    </article>
  );
}
