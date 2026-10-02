import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { formatDateTime, formatMoney, remainingSpots } from "@/lib/utils";

type EventCardProps = {
  id: string;
  venueSlug: string;
  title: string;
  startsAt: Date;
  price: number;
  capacity: number;
  reservedGuests: number;
};

export async function EventCard({
  id,
  venueSlug,
  title,
  startsAt,
  price,
  capacity,
  reservedGuests,
}: EventCardProps) {
  const t = await getTranslations("event");
  const locale = await getLocale();
  const left = remainingSpots(capacity, reservedGuests);

  return (
    <Link
      href={`/v/${venueSlug}/events/${id}`}
      className="flex flex-col justify-between rounded-2xl border border-paper-line bg-paper p-5 text-paper-text transition hover:border-paper-text/25"
    >
      <div>
        <p className="text-xs font-medium text-paper-muted">{formatDateTime(startsAt, locale)}</p>
        <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-6 flex items-end justify-between text-sm">
        <p>
          {formatMoney(price, locale)}
          <span className="text-paper-muted"> / {t("perPerson")}</span>
        </p>
        <p className={left === 0 ? "text-danger" : "text-paper-muted"}>
          {left === 0 ? t("soldOut") : `${left} · ${t("spots")}`}
        </p>
      </div>
    </Link>
  );
}
