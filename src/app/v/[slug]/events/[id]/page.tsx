import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { BookingForm } from "@/components/booking-form";
import { PageBack } from "@/components/page-back";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney, liveGuestCount, remainingSpots } from "@/lib/utils";

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
      reservations: true,
    },
  });

  if (!event || (slug && event.venue.slug !== slug)) notFound();
  if (event.startsAt.getTime() < Date.now()) notFound();

  const reserved = liveGuestCount(event.reservations);
  const left = remainingSpots(event.capacity, reserved);
  const venueSlug = event.venue.slug;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <PageBack href={`/v/${venueSlug}`} label={event.venue.name} />
        <h1 className="text-3xl font-bold tracking-tight text-cream">{event.title}</h1>
        <p className="mt-4 font-medium text-cream">{formatDateTime(event.startsAt, locale)}</p>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream">{event.description}</p>
        <dl className="mt-10 grid max-w-md grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl border border-paper-line bg-paper p-4 text-paper-text">
            <dt className="font-semibold text-paper-muted">{t("price")}</dt>
            <dd className="mt-1 text-lg font-bold">{formatMoney(event.price, locale)}</dd>
          </div>
          <div className="rounded-2xl border border-paper-line bg-paper p-4 text-paper-text">
            <dt className="font-semibold text-paper-muted">{t("spots")}</dt>
            <dd className="mt-1 text-lg font-bold">{left === 0 ? t("soldOut") : left}</dd>
          </div>
        </dl>
      </div>
      <aside className="rounded-2xl border border-paper-line bg-paper p-6 text-paper-text">
        <h2 className="text-lg font-bold">{tb("title")}</h2>
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
