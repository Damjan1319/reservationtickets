import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { EventCard } from "@/components/event-card";
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
import { tableGuestsForSlot } from "@/lib/door";
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
  const { slug } = await params;
  const query = await searchParams;
  const initialMeal = MEAL_TYPES.includes(query.meal as (typeof MEAL_TYPES)[number])
    ? (query.meal as (typeof MEAL_TYPES)[number])
    : undefined;
  const initialTab = query.tab === "menu" || query.tab === "events" || query.tab === "reviews" ? query.tab : undefined;
  const t = await getTranslations("venue");
  const tb = await getTranslations("booking");
  const tn = await getTranslations("nav");
  const session = await auth();
  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      events: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        include: { reservations: true },
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
  const isTeam = Boolean(
    session?.user?.id &&
      (await prisma.staffMembership.findFirst({
        where: { venueId: venue.id, userId: session.user.id },
        select: { id: true },
      })),
  );
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
  const reservedByMeal = Object.fromEntries(
    await Promise.all(
      MEAL_TYPES.map(async (meal) => [meal, await tableGuestsForSlot(venue.id, day, meal)] as const),
    ),
  );

  const addressLine = [venue.address && venue.address !== venue.city ? venue.address : null, venue.phone]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venueCover(venue.type, venue.coverUrl)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-black/35" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:py-16">
          <PageBack href="/search" label={tn("venues")} onImage />
          <div>
            <p className="text-sm font-medium text-cream/80">
              {t(`types.${venue.type}`)} · {venue.city}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-cream sm:text-5xl">{venue.name}</h1>
            {venue.description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-cream/85">{venue.description}</p>
            ) : null}
            {addressLine || venue.proofUrl ? (
              <p className="mt-5 text-sm font-medium text-cream/70">
                {addressLine}
                {addressLine && venue.proofUrl ? " · " : null}
                {venue.proofUrl ? (
                  <a href={venue.proofUrl} target="_blank" rel="noreferrer" className="hover:text-cream hover:underline">
                    {t("maps")}
                  </a>
                ) : null}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:gap-12 lg:py-10">
        <div className="min-w-0">
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
            events={
              venue.events.length === 0 ? (
                <p className="text-cream/70">{t("noEvents")}</p>
              ) : (
                <div className="grid gap-4">
                  {venue.events.map((event) => (
                    <EventCard
                      key={event.id}
                      id={event.id}
                      venueSlug={venue.slug}
                      venueName={venue.name}
                      title={event.title}
                      artist={event.artist}
                      startsAt={event.startsAt}
                      price={event.price}
                      capacity={event.capacity}
                      reservedGuests={liveGuestCount(event.reservations)}
                    />
                  ))}
                </div>
              )
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
          />
        </div>

        <aside id="rezervacija" className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">{t("tableTitle")}</h2>
          <p className="mt-2 text-sm font-medium text-paper-muted">{t("tableSubtitle")}</p>
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
        </aside>
      </section>
    </div>
  );
}
