import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { setVenueVerification } from "@/app/actions/venue";
import { PageHeader } from "@/components/page-header";
import { StatsDashboard } from "@/components/stats-dashboard";
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <nav className="mt-6 flex flex-wrap gap-1.5">
        {(
          [
            ["stats", t("statsTab")],
            ["pending", pendingCount ? `${t("pendingTab")} · ${pendingCount}` : t("pendingTab")],
            ["venues", t("venuesTab")],
            ["bookings", t("bookingsTab")],
          ] as const
        ).map(([key, label]) => (
          <Link
            key={key}
            href={viewHref(key)}
            className={cn(
              "rounded-full px-3 py-1 text-[13px] font-semibold transition",
              view === key ? "bg-paper text-paper-text" : "border border-line text-cream/80 hover:bg-surface",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {view === "stats" && pendingCount > 0 ? (
        <p className="mt-6 text-sm font-medium text-cream">
          <Link href={viewHref("pending")} className="underline underline-offset-2 hover:text-white">
            {t("pendingCue", { count: pendingCount })}
          </Link>
        </p>
      ) : null}

      {view === "stats" ? (
        <section className="mt-6">
          <StatsDashboard reservations={reservations} period={period} basePath="/admin" locale={locale} />
        </section>
      ) : null}

      {view === "pending" ? (
        <section className="mt-6 space-y-3">
          {pending.length === 0 ? (
            <p className="text-cream/70">{t("empty")}</p>
          ) : (
            pending.map((venue) => <VenueAdminCard key={venue.id} venue={venue} tv={tv} t={t} />)
          )}
        </section>
      ) : null}

      {view === "venues" ? (
        <section className="mt-6 space-y-3">
          {venues.map((venue) => (
            <VenueAdminCard key={venue.id} venue={venue} tv={tv} t={t} showCounts />
          ))}
        </section>
      ) : null}

      {view === "bookings" ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
          {reservations.length === 0 ? (
            <p className="p-5 text-cream/70">{t("emptyBookings")}</p>
          ) : (
            <ul className="divide-y divide-line">
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
                      <p className="text-base font-bold text-cream">{title}</p>
                      <p className="mt-1 text-sm text-cream/65">
                        {item.venue.name} · {item.user.name} · {item.user.email} · {formatDateTime(item.visitAt, locale)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-cream/70">
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
    coverUrl?: string;
    verificationStatus: string;
    owner: { email: string; name: string };
    _count: { reservations: number; events: number };
  };
  tv: Awaited<ReturnType<typeof getTranslations>>;
  t: Awaited<ReturnType<typeof getTranslations>>;
  showCounts?: boolean;
}) {
  const status =
    venue.verificationStatus === "VERIFIED"
      ? tv("verified")
      : venue.verificationStatus === "REJECTED"
        ? tv("rejected")
        : tv("pending");

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="grid sm:grid-cols-[140px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={venueCover(venue.type, venue.coverUrl)} alt="" className="h-32 w-full object-cover sm:h-full" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-cream/60">
                {tv(`types.${venue.type}`)} · {venue.city}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-cream">{venue.name}</h2>
              <p className="mt-1 text-sm text-cream/70">
                {venue.owner.name} · {venue.owner.email}
              </p>
              <p className="mt-2 text-sm text-cream/55">
                {venue.address}
                {venue.phone ? ` · ${venue.phone}` : ""}
                {venue.pib ? ` · ${tv("pib")} ${venue.pib}` : ""}
              </p>
              {venue.proofUrl ? (
                <a
                  href={venue.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-sm font-medium text-cream/80 hover:text-cream hover:underline"
                >
                  {tv("maps")}
                </a>
              ) : null}
              {showCounts ? (
                <p className="mt-2 text-xs text-cream/50">
                  {venue._count.events} · {venue._count.reservations} · {venue.slug}.ulaznice.rs
                </p>
              ) : null}
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                venue.verificationStatus === "VERIFIED"
                  ? "bg-paper text-paper-text"
                  : venue.verificationStatus === "REJECTED"
                    ? "border border-danger text-danger"
                    : "border border-line text-cream/80",
              )}
            >
              {status}
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
