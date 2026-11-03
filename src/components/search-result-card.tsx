import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { isEventIntent, isTableIntent, resultHref, type SearchQuery, type SearchVenue } from "@/lib/search";
import { formatDateTime, formatMoney } from "@/lib/utils";

type SearchText = Awaited<ReturnType<typeof getTranslations<"search">>>;
type VenueText = Awaited<ReturnType<typeof getTranslations<"venue">>>;

export async function SearchResultList({
  venues,
  query,
  className = "grid gap-4",
}: {
  venues: SearchVenue[];
  query: SearchQuery;
  className?: string;
}) {
  const [t, tv, tr, locale] = await Promise.all([
    getTranslations("search"),
    getTranslations("venue"),
    getTranslations("review"),
    getLocale(),
  ]);
  const countLabel = tr("countLabel");

  return (
    <div className={className}>
      {venues.map((venue, index) => (
        <SearchResultCard
          key={venue.id}
          venue={venue}
          query={query}
          t={t}
          tv={tv}
          countLabel={countLabel}
          locale={locale}
          eagerImage={index === 0}
        />
      ))}
    </div>
  );
}

function SearchResultCard({
  venue,
  query,
  t,
  tv,
  countLabel,
  locale,
  eagerImage,
}: {
  venue: SearchVenue;
  query: SearchQuery;
  t: SearchText;
  tv: VenueText;
  countLabel: string;
  locale: string;
  eagerImage: boolean;
}) {
  const href = resultHref(venue, query);
  const eventMode = isEventIntent(query);
  const tableMode = isTableIntent(query);
  const cta = eventMode ? t("takeTicket") : tableMode ? t("seeMenu") : t("seeVenue");

  return (
    <article className="relative flex flex-col gap-4 border-t border-line py-5 text-paper-text sm:flex-row sm:gap-5">
      <Link href={href} className="absolute inset-0 z-10" aria-label={`${venue.name}. ${cta}`} />

      <div className="h-44 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:h-32 sm:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.coverUrl}
          alt=""
          decoding="async"
          loading={eagerImage ? "eager" : "lazy"}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-xs font-medium text-paper-muted">
          {tv(`types.${venue.type}`)} · {venue.city}
          {venue.hasMenu && !eventMode ? ` · ${t("hasMenu")}` : ""}
        </p>
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{venue.name}</h2>
        <p className="text-[13px] text-paper-muted">
          {venue.ratingAvg && venue.ratingCount > 0 ? `★ ${venue.ratingAvg.toFixed(1)} · ${venue.ratingCount} ${countLabel}` : null}
          {venue.ratingAvg && venue.ratingCount > 0 && venue.address && venue.address !== venue.city ? " · " : null}
          {venue.address && venue.address !== venue.city ? venue.address : null}
        </p>
        {venue.promoTitle ? (
          <p className="mt-1 self-start rounded-full border border-paper-line px-2.5 py-0.5 text-xs font-medium">
            {venue.promoTitle}
          </p>
        ) : null}
        {venue.description && !eventMode ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-paper-muted">{venue.description}</p>
        ) : null}
        {eventMode && venue.events.length > 0 ? (
          <ul className="relative z-20 mt-1 space-y-2">
            {venue.events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/v/${venue.slug}/events/${event.id}?guests=${query.guests}`}
                  className="text-sm font-semibold hover:underline"
                >
                  {event.title}
                  <span className="mt-0.5 block font-normal text-paper-muted">
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

      <div className="flex shrink-0 flex-row items-end justify-between gap-3 sm:w-48 sm:flex-col sm:text-right">
        <div className="space-y-1 text-sm">
          {eventMode ? (
            venue.nextEvent ? (
              <>
                <p className="font-semibold text-success">
                  {t("eventLeft", { count: venue.nextEvent.left })}
                  {venue.nextEvent.price > 0
                    ? ` · ${t("fromPrice", { price: formatMoney(venue.nextEvent.price, locale) })}`
                    : null}
                </p>
                <p className="text-[13px] text-paper-muted">{formatDateTime(new Date(venue.nextEvent.startsAt), locale)}</p>
              </>
            ) : (
              <p className="text-paper-muted">{t("noEvents")}</p>
            )
          ) : (
            <>
              {venue.closed ? (
                <p className="font-semibold text-danger">{t("closed")}</p>
              ) : venue.tableLeft != null ? (
                <p className={venue.bookableTable ? "font-semibold text-success" : "font-semibold text-danger"}>
                  {venue.bookableTable ? t("tableLeft", { count: venue.tableLeft }) : t("tableFull")}
                </p>
              ) : (
                <p className="font-semibold">{t("tableOpen")}</p>
              )}
              {!tableMode && venue.nextEvent ? (
                <p className="text-[13px] text-paper-muted">
                  {t("eventLeft", { count: venue.nextEvent.left })}
                  {venue.nextEvent.price > 0
                    ? ` · ${t("fromPrice", { price: formatMoney(venue.nextEvent.price, locale) })}`
                    : null}
                </p>
              ) : (
                <p className="text-[13px] text-paper-muted">{t("hours", { opens: venue.opensAt, closes: venue.closesAt })}</p>
              )}
            </>
          )}
        </div>
        <span className="btn btn-ghost pointer-events-none shrink-0">{cta}</span>
      </div>
    </article>
  );
}
