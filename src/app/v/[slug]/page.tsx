import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { PageBack } from "@/components/page-back";
import { TableBookingForm } from "@/components/table-booking-form";
import { VenueMenu } from "@/components/venue-menu";
import { VenueOffers } from "@/components/venue-offers";
import { VenuePanel } from "@/components/venue-panel";
import { VenueReviews } from "@/components/venue-reviews";
import { isPromoLive } from "@/lib/offers";
import { summarizeReviews } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";
import { MEAL_TYPES } from "@/lib/constants";
import { tableGuestsForDay } from "@/lib/door";
import { todayKey } from "@/lib/time";
import { venueHref } from "@/lib/search";
import { liveGuestCount, venueCover } from "@/lib/utils";

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; guests?: string; meal?: string; tab?: string }>;
}) {
  const [{ slug }, query, t, tb, tn, session] = await Promise.all([
    params,
    searchParams,
    getTranslations("venue"),
    getTranslations("booking"),
    getTranslations("nav"),
    auth(),
  ]);
  const initialMeal = MEAL_TYPES.includes(query.meal as (typeof MEAL_TYPES)[number])
    ? (query.meal as (typeof MEAL_TYPES)[number])
    : undefined;
  const initialTab = query.tab === "menu" || query.tab === "events" || query.tab === "reviews" ? query.tab : undefined;
  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      events: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        include: { reservations: { select: { guests: true, status: true } } },
      },
      menus: {
        where: { published: true },
        orderBy: { createdAt: "asc" },
        include: { items: { where: { available: true }, orderBy: [{ section: "asc" }, { createdAt: "asc" }] } },
      },
      promotions: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!venue) notFound();

  const isOwner = session?.user?.id === venue.ownerId;
  const isPublic = venue.verificationStatus === "VERIFIED";
  if (!isPublic && !isOwner) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24">
        <h1 className="text-2xl font-semibold tracking-tight">{venue.name}</h1>
        <p className="mt-4 text-muted">{t("pendingPublic")}</p>
      </div>
    );
  }

  const day = todayKey();
  const [membership, reservedByMeal] = await Promise.all([
    session?.user?.id
      ? prisma.staffMembership.findFirst({
          where: { venueId: venue.id, userId: session.user.id },
          select: { id: true },
        })
      : Promise.resolve(null),
    tableGuestsForDay(venue.id, day),
  ]);
  const isTeam = Boolean(membership);

  const addressLine = [venue.address && venue.address !== venue.city ? venue.address : null, venue.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-6">
        <PageBack href="/search" label={tn("venues")} />
        <div className="-mt-4 overflow-hidden rounded-xl bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venueCover(venue.type, venue.coverUrl)}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-56 w-full object-cover sm:h-80"
          />
        </div>
        <div className="pt-8">
          <p className="text-[13px] font-medium text-muted">
            {t(`types.${venue.type}`)} · {venue.city}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-cream sm:text-4xl">{venue.name}</h1>
          {addressLine || venue.proofUrl ? (
            <p className="mt-2.5 text-sm text-muted">
              {addressLine}
              {addressLine && venue.proofUrl ? " · " : null}
              {venue.proofUrl ? (
                <a
                  href={venue.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cream underline underline-offset-[3px]"
                >
                  {t("maps")}
                </a>
              ) : null}
            </p>
          ) : null}
          {venue.description ? (
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-cream">{venue.description}</p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-8">
        <VenueOffers
          promos={venue.promotions.filter(isPromoLive).map((promo) => ({
            id: promo.id,
            title: promo.title,
            body: promo.body,
            kind: promo.kind,
          }))}
        />
        <VenuePanel
          initialTab={initialTab}
          menuCount={venue.menus.reduce((sum, menu) => sum + menu.items.length, 0)}
          eventCount={venue.events.length}
          reviewCount={venue.reviews.length}
          loggedIn={Boolean(isPublic && session?.user)}
          loginHref={`/login?callbackUrl=${encodeURIComponent(`/v/${slug}?tab=events`)}`}
          initialGuests={Number.parseInt(query.guests ?? "", 10) || undefined}
          events={venue.events.map((event) => ({
            id: event.id,
            title: event.title,
            artist: event.artist?.trim() || venue.name,
            startsAt: event.startsAt.toISOString(),
            price: event.price,
            capacity: event.capacity,
            reservedGuests: liveGuestCount(event.reservations),
          }))}
          menu={
            <VenueMenu
              menus={venue.menus
                .filter((menu) => menu.items.length > 0)
                .map((menu) => ({
                  id: menu.id,
                  title: menu.title,
                  kind: menu.kind,
                  items: menu.items,
                }))}
            />
          }
          reviews={
            <VenueReviews
              venueId={venue.id}
              venueType={venue.type}
              slug={venue.slug}
              summary={summarizeReviews(venue.reviews)}
              items={venue.reviews.map((item) => ({
                id: item.id,
                name: item.user.name,
                body: item.body,
                food: item.food,
                drinks: item.drinks,
                night: item.night,
              }))}
              mine={
                venue.reviews
                  .filter((item) => item.userId === session?.user?.id)
                  .map((item) => ({
                    id: item.id,
                    name: item.user.name,
                    body: item.body,
                    food: item.food,
                    drinks: item.drinks,
                    night: item.night,
                  }))[0] ?? null
              }
              canReview={Boolean(session?.user?.id && !isOwner && !isTeam)}
              loggedIn={Boolean(session?.user)}
            />
          }
          tableAside={
            <>
              <h2 className="text-lg font-semibold">{t("tableTitle")}</h2>
              <p className="mt-1.5 text-[13px] text-paper-muted">{t("tableSubtitle")}</p>
              {isPublic && session?.user ? (
                <div className="mt-6">
                  <TableBookingForm
                    venueId={venue.id}
                    tableCapacity={venue.tableCapacity}
                    reservedByMeal={reservedByMeal}
                    closed={venue.closed}
                    opensAt={venue.opensAt}
                    closesAt={venue.closesAt}
                    initialDate={query.date}
                    initialGuests={Number.parseInt(query.guests ?? "", 10) || undefined}
                    initialMeal={initialMeal}
                  />
                </div>
              ) : isPublic ? (
                <div className="mt-6 space-y-4">
                  <p className="text-paper-muted">{tb("needLogin")}</p>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(venueHref(slug, { date: query.date ?? "", guests: Number.parseInt(query.guests ?? "", 10) || 2 }))}`}
                    className="btn btn-primary"
                  >
                    {tn("login")}
                  </Link>
                </div>
              ) : (
                <p className="mt-6 text-paper-muted">{t("pendingPublic")}</p>
              )}
            </>
          }
        />
      </section>
    </div>
  );
}
