import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { BookingForm } from "@/components/booking-form";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney, remainingSpots } from "@/lib/utils";

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const raw = await params;
  const slug = String(raw.slug ?? "");
  const id = String(raw.id ?? "");
  const t = await getTranslations("event");
  const tb = await getTranslations("booking");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      reservations: { where: { status: { not: "CANCELLED" } }, select: { guests: true } },
    },
  });

  if (!event || (slug && event.venue.slug !== slug)) notFound();
  if (event.startsAt.getTime() < Date.now()) notFound();

  const reserved = event.reservations.reduce((sum, item) => sum + item.guests, 0);
  const left = remainingSpots(event.capacity, reserved);
  const venueSlug = event.venue.slug;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <Link href={`/v/${venueSlug}`} className="text-sm text-muted hover:text-cream">
          {event.venue.name}
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{event.title}</h1>
        <p className="mt-4 text-muted">{formatDateTime(event.startsAt, locale)}</p>
        <p className="mt-6 max-w-xl text-lg text-muted">{event.description}</p>
        <dl className="mt-10 grid max-w-md grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-paper-line bg-paper p-4 text-paper-text">
            <dt className="text-paper-muted">{t("price")}</dt>
            <dd className="mt-1 text-lg">{formatMoney(event.price, locale)}</dd>
          </div>
          <div className="rounded-2xl border border-paper-line bg-paper p-4 text-paper-text">
            <dt className="text-paper-muted">{t("spots")}</dt>
            <dd className="mt-1 text-lg">{left === 0 ? t("soldOut") : left}</dd>
          </div>
        </dl>
      </div>
      <aside className="rounded-2xl border border-paper-line bg-paper p-6 text-paper-text">
        <h2 className="text-lg font-semibold">{tb("title")}</h2>
        {event.venue.verificationStatus !== "VERIFIED" ? (
          <p className="mt-4 text-paper-muted">{tb("unverified")}</p>
        ) : session?.user ? (
          <div className="mt-6">
            <BookingForm eventId={event.id} price={event.price} remaining={left} locale={locale} />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-paper-muted">{tb("needLogin")}</p>
            <Link
              href={`/login?callbackUrl=/v/${venueSlug}/events/${event.id}`}
              className="btn btn-primary"
            >
              {tn("login")}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
