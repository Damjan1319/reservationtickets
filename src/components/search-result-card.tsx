import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { type SearchQuery, type SearchVenue, venueHref } from "@/lib/search";
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
  const locale = await getLocale();
  const href = venueHref(venue.slug, query);

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
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">
            <Link href={href} className="hover:underline">
              {venue.name}
            </Link>
          </h2>
          {venue.address && venue.address !== venue.city ? (
            <p className="mt-1 text-sm font-medium text-paper-muted">{venue.address}</p>
          ) : null}
          {venue.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-paper-muted">{venue.description}</p>
          ) : null}
        </div>
        <p className="mt-4 text-sm font-medium text-paper-muted">
          {t("hours", { opens: venue.opensAt, closes: venue.closesAt })}
        </p>
      </div>

      <div className="flex flex-col justify-between border-t border-paper-line p-5 md:border-l md:border-t-0">
        <div className="space-y-1.5 text-sm font-semibold">
          {venue.closed ? (
            <p className="text-danger">{t("closed")}</p>
          ) : venue.tableLeft != null ? (
            <p className={venue.bookableTable ? "text-paper-text" : "text-danger"}>
              {venue.bookableTable ? t("tableLeft", { count: venue.tableLeft }) : t("tableFull")}
            </p>
          ) : (
            <p>{t("tableOpen")}</p>
          )}
          {venue.nextEvent ? (
            <p>
              {t("eventLeft", { count: venue.nextEvent.left })}
              {venue.nextEvent.price > 0 ? ` · ${t("fromPrice", { price: formatMoney(venue.nextEvent.price, locale) })}` : null}
            </p>
          ) : (
            <p className="font-medium text-paper-muted">{t("noEvents")}</p>
          )}
          {venue.nextEvent ? (
            <p className="font-medium text-paper-muted">{formatDateTime(new Date(venue.nextEvent.startsAt), locale)}</p>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Link href={href} className="btn btn-primary btn-full">
            {query.kind === "event" ? t("seeTickets") : t("seeVenue")}
          </Link>
          {venue.nextEvent && query.kind !== "table" ? (
            <Link
              href={`/v/${venue.slug}/events/${venue.nextEvent.id}?guests=${query.guests}`}
              className="btn btn-ghost btn-full"
            >
              {venue.nextEvent.title}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
