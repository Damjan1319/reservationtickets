import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { setVenueVerification } from "@/app/actions/venue";
import { PageHeader } from "@/components/page-header";
import { StatsDashboard } from "@/components/stats-dashboard";
import { StatCard } from "@/components/stat-card";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/staff";
import { parsePeriod } from "@/lib/stats";
import { cn, formatDateTime, venueCover } from "@/lib/utils";

const VIEWS = ["stats", "pending", "venues", "bookings"] as const;
type View = (typeof VIEWS)[number];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin");

  const { view: rawView, period: rawPeriod } = await searchParams;
  const view: View = VIEWS.includes(rawView as View) ? (rawView as View) : "stats";
  const period = parsePeriod(rawPeriod);
  const t = await getTranslations("admin");
  const tv = await getTranslations("venue");
  const tb = await getTranslations("booking");
  const tt = await getTranslations("ticket");
  const locale = await getLocale();

  const [venues, reservations, pendingCount] = await Promise.all([
    prisma.venue.findMany({
      include: {
        owner: true,
        _count: { select: { reservations: true, events: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reservation.findMany({
      include: { venue: true, user: true, event: true, tickets: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.venue.count({ where: { verificationStatus: "PENDING" } }),
  ]);

  const pending = venues.filter((venue) => venue.verificationStatus === "PENDING");

  const viewHref = (next: View) => {
    const params = new URLSearchParams();
    if (next !== "stats") params.set("view", next);
    if (period !== "week") params.set("period", period);
    const query = params.toString();
    return query ? `/admin?${query}` : "/admin";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <PageHeader eyebrow="Ulaznice" title={t("title")} description={t("subtitle")} />

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("statPending")} value={pendingCount} hint={t("statPendingHint")} tone="warn" />
        <StatCard label={t("statVenues")} value={venues.length} hint={t("statVenuesHint")} tone="both" />
        <StatCard label={t("statBookings")} value={reservations.length} hint={t("statBookingsHint")} tone="event" />
        <StatCard
          label={t("statEmails")}
          value={new Set(reservations.map((item) => item.user.email)).size}
          hint={t("statEmailsHint")}
          tone="table"
        />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["stats", t("statsTab")],
            ["pending", `${t("pendingTab")} · ${pendingCount}`],
            ["venues", `${t("venuesTab")} · ${venues.length}`],
            ["bookings", `${t("bookingsTab")} · ${reservations.length}`],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={viewHref(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              view === key ? "bg-paper text-paper-text" : "border border-line text-muted hover:text-cream",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {view === "stats" ? (
        <section className="mt-8">
          <StatsDashboard reservations={reservations} period={period} basePath="/admin" />
        </section>
      ) : null}

      {view === "pending" ? (
        <section className="mt-8 space-y-4">
          {pending.length === 0 ? (
            <p className="text-paper-muted">{t("empty")}</p>
          ) : (
            pending.map((venue) => <VenueAdminCard key={venue.id} venue={venue} tv={tv} t={t} />)
          )}
        </section>
      ) : null}

      {view === "venues" ? (
        <section className="mt-8 space-y-4">
          {venues.map((venue) => (
            <VenueAdminCard key={venue.id} venue={venue} tv={tv} t={t} showCounts />
          ))}
        </section>
      ) : null}

      {view === "bookings" ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-paper-line bg-paper text-paper-text">
          {reservations.length === 0 ? (
            <p className="p-6 text-paper-muted">{t("emptyBookings")}</p>
          ) : (
            <ul className="divide-y divide-paper-line">
              {reservations.slice(0, 50).map((item) => {
                const title =
                  item.kind === "TABLE" && item.mealType
                    ? `${tt("table")} · ${tb(`meals.${item.mealType}`)}`
                    : (item.event?.title ?? item.venue.name);
                const inside =
                  item.kind === "EVENT"
                    ? item.tickets.filter((ticket) => ticket.checkedInAt).length
                    : item.checkedInCount;
                return (
                  <li key={item.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-base font-semibold">{title}</p>
                      <p className="text-sm text-paper-muted">
                        {item.venue.name} · {item.user.name} · {item.user.email} · {formatDateTime(item.visitAt, locale)}
                      </p>
                    </div>
                    <p className="text-sm text-paper-muted">
                      {item.guests} · {inside}/{item.guests}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function VenueAdminCard({
  venue,
  tv,
  t,
  showCounts,
}: {
  venue: {
    id: string;
    name: string;
    slug: string;
    type: string;
    city: string;
    address: string;
    phone: string;
    pib: string;
    proofUrl: string;
    verificationStatus: string;
    owner: { email: string; name: string };
    _count: { reservations: number; events: number };
  };
  tv: Awaited<ReturnType<typeof getTranslations>>;
  t: Awaited<ReturnType<typeof getTranslations>>;
  showCounts?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-paper-line bg-paper text-paper-text">
      <div className="grid sm:grid-cols-[160px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venueCover(venue.type)} alt="" className="h-36 w-full object-cover sm:h-full" />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-paper-muted">
                {tv(`types.${venue.type}`)} · {venue.city}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">{venue.name}</h2>
              <p className="mt-1 text-sm text-paper-muted">{venue.address}</p>
              <p className="mt-2 text-sm">
                {tv("pib")}: {venue.pib} · {venue.phone}
              </p>
              <a href={venue.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-paper-text">
                {tv("maps")}
              </a>
              <p className="mt-2 text-xs text-paper-muted">
                {venue.owner.name} · {venue.owner.email}
              </p>
              {showCounts ? (
                <p className="mt-2 text-xs text-paper-muted">
                  {venue._count.events} · {venue._count.reservations} · {venue.slug}.ulaznice.rs
                </p>
              ) : null}
            </div>
            <span className="rounded-full border border-paper-line px-3 py-1 text-xs uppercase">
              {venue.verificationStatus === "VERIFIED"
                ? tv("verified")
                : venue.verificationStatus === "REJECTED"
                  ? tv("rejected")
                  : tv("pending")}
            </span>
          </div>
          {venue.verificationStatus !== "VERIFIED" ? (
            <div className="mt-4 flex gap-2">
              <form
                action={async () => {
                  "use server";
                  await setVenueVerification(venue.id, "VERIFIED");
                }}
              >
                <button type="submit" className="btn btn-primary !px-4 !py-2">
                  {t("approve")}
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await setVenueVerification(venue.id, "REJECTED");
                }}
              >
                <button type="submit" className="btn btn-ghost !px-4 !py-2">
                  {t("reject")}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
