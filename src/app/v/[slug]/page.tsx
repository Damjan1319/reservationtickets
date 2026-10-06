import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { CopyLink } from "@/components/copy-link";
import { EventCard } from "@/components/event-card";
import { TableBookingForm } from "@/components/table-booking-form";
import { prisma } from "@/lib/prisma";
import { venueCover, venuePublicHost } from "@/lib/utils";

export default async function VenuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
        include: { reservations: { where: { status: { not: "CANCELLED" } }, select: { guests: true } } },
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

  const publicLink = `https://${venuePublicHost(venue.slug)}`;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venueCover(venue.type)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/45" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-medium text-muted">
            {t(`types.${venue.type}`)} · {venue.city}
            {isPublic ? ` · ${t("verified")}` : ` · ${t("pending")}`}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{venue.name}</h1>
          <p className="mt-3 max-w-2xl text-base text-cream/85">{venue.description}</p>
          <p className="mt-4 text-sm text-muted">
            {venue.address} · {venue.phone}
          </p>
          <a href={venue.proofUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-muted hover:text-cream">
            {t("maps")}
          </a>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">{t("publicLink")}:</span>
            <code className="rounded-full border border-line bg-surface/80 px-3 py-1 text-cream">
              {venue.slug}.ulaznice.rs
            </code>
            <CopyLink value={publicLink} />
            <span className="text-muted">/v/{venue.slug}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("upcoming")}</h2>
          {venue.events.length === 0 ? (
            <p className="mt-6 text-muted">{t("noEvents")}</p>
          ) : (
            <div className="mt-8 grid gap-5">
              {venue.events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  venueSlug={venue.slug}
                  title={event.title}
                  startsAt={event.startsAt}
                  price={event.price}
                  capacity={event.capacity}
                  reservedGuests={event.reservations.reduce((sum, item) => sum + item.guests, 0)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-paper-line bg-paper p-6 text-paper-text">
          <h2 className="text-lg font-semibold">{t("tableTitle")}</h2>
          <p className="mt-2 text-sm text-paper-muted">{t("tableSubtitle")}</p>
          {isPublic && session?.user ? (
            <div className="mt-6">
              <TableBookingForm venueId={venue.id} />
            </div>
          ) : isPublic ? (
            <div className="mt-6 space-y-4">
              <p className="text-paper-muted">{tb("needLogin")}</p>
              <Link
                href={`/login?callbackUrl=/v/${slug}`}
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
