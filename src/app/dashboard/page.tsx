import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ReservationCalendar } from "@/components/reservation-calendar";
import { StatCard } from "@/components/stat-card";
import { StatsDashboard } from "@/components/stats-dashboard";
import { monthKey, monthLabel, occupancyByDay, parseMonth, shiftMonth } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";
import { parsePeriod } from "@/lib/stats";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; month?: string }>;
}) {
  const context = await getStaffContext();
  if (!context) return null;
  if (context.role === "STAFF") redirect("/dashboard/scan");

  const { period: rawPeriod, month: rawMonth } = await searchParams;
  const period = parsePeriod(rawPeriod);
  const { year, month } = parseMonth(rawMonth);
  const t = await getTranslations("dashboard");
  const locale = await getLocale();
  const now = new Date();
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const periodQuery = period === "week" ? "" : `period=${period}&`;

  const [events, reservations] = await Promise.all([
    prisma.event.findMany({
      where: { venueId: context.venue.id },
      include: { reservations: { select: { guests: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.reservation.findMany({
      where: { venueId: context.venue.id },
      include: {
        user: { select: { email: true, name: true } },
        tickets: { select: { checkedInAt: true } },
      },
    }),
  ]);

  const tickets = reservations.filter((item) => item.kind === "EVENT");
  const tables = reservations.filter((item) => item.kind === "TABLE");
  const inside =
    tickets.reduce((sum, item) => sum + item.tickets.filter((ticket) => ticket.checkedInAt).length, 0) +
    tables.reduce((sum, item) => sum + item.checkedInCount, 0);
  const unpaid = reservations.filter((item) => item.paymentStatus === "UNPAID").length;
  const upcoming = events.filter((event) => event.startsAt >= now).slice(0, 4);
  const occupancy = occupancyByDay(reservations);

  const actions = [
    { href: "/dashboard/create", title: t("quickCreate"), hint: t("quickCreateHint") },
    { href: "/dashboard/scan", title: t("quickScan"), hint: t("quickScanHint") },
    { href: "/dashboard/reservations", title: t("quickList"), hint: t("quickListHint") },
  ];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("overview")} title={context.venue.name} description={t("statsIntro")} />

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="overflow-hidden rounded-2xl border border-paper-line bg-paper p-5 text-paper-text transition hover:border-paper-text/30"
          >
            <p className="text-lg font-semibold">{action.title}</p>
            <p className="mt-1 text-sm text-paper-muted">{action.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <ReservationCalendar
          year={year}
          month={month}
          occupancy={occupancy}
          dayHref={(key) => `/dashboard/reservations?date=${key}`}
          prevHref={`/dashboard?${periodQuery}month=${monthKey(prev.year, prev.month)}`}
          nextHref={`/dashboard?${periodQuery}month=${monthKey(next.year, next.month)}`}
          monthTitle={monthLabel(year, month, locale)}
          weekdays={t.raw("calWeekdays") as string[]}
          legendTables={t("calTables")}
          legendEvents={t("calEvents")}
          legendBoth={t("calBoth")}
          legendFree={t("calFree")}
        />

        <section className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t("tonight")}</h2>
            <Link href="/dashboard/events" className="text-sm text-paper-muted hover:text-paper-text">
              {t("parties")}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-paper-muted">{t("emptyEvents")}</p>
            ) : (
              upcoming.map((event) => {
                const reserved = event.reservations.reduce((sum, item) => sum + item.guests, 0);
                return (
                  <div key={event.id} className="rounded-xl bg-paper-2 px-4 py-3">
                    <p className="text-base font-semibold">{event.title}</p>
                    <p className="text-sm text-paper-muted">{formatDateTime(event.startsAt, locale)}</p>
                    <p className="mt-1 text-sm text-paper-muted">
                      {t("sold")}: {reserved}/{event.capacity}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <StatsDashboard reservations={reservations} period={period} basePath="/dashboard" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("statsParties")} value={events.length} hint={t("statsPartiesHint")} tone="event" />
        <StatCard label={t("statsTables")} value={tables.length} hint={t("statsTablesHint")} tone="table" />
        <StatCard label={t("statsInside")} value={inside} hint={t("statsInsideHint")} tone="both" />
        <StatCard label={t("statsUnpaid")} value={unpaid} hint={t("statsUnpaidHint")} tone="warn" />
      </div>
    </div>
  );
}
