import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ReservationCalendar } from "@/components/reservation-calendar";
import { StatsDashboard } from "@/components/stats-dashboard";
import { monthKey, monthLabel, occupancyByDay, parseMonth, shiftMonth } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";
import { parsePeriod } from "@/lib/stats";
import { formatDateTime, liveGuestCount } from "@/lib/utils";

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
      where: { venueId: context.venue.id, startsAt: { gte: now } },
      include: { reservations: true },
      orderBy: { startsAt: "asc" },
    }),
    prisma.reservation.findMany({
      where: { venueId: context.venue.id },
      include: {
        user: { select: { email: true, name: true } },
        tickets: { select: { checkedInAt: true } },
        event: { select: { price: true } },
      },
    }),
  ]);

  const live = reservations.filter((item) => item.status !== "CANCELLED");
  const upcoming = events.slice(0, 4);
  const occupancy = occupancyByDay(live);

  return (
    <div className="space-y-8">
      <PageHeader title={context.venue.name} description={t("statsIntro")} />

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/create" className="btn btn-primary !px-4 !py-2">
          {t("quickCreate")}
        </Link>
        <Link href="/dashboard/scan" className="btn btn-ghost !px-4 !py-2">
          {t("quickScan")}
        </Link>
        <Link href="/dashboard/reservations" className="btn btn-ghost !px-4 !py-2">
          {t("quickList")}
        </Link>
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

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-cream">{t("tonight")}</h2>
            <Link href="/dashboard/events" className="text-sm font-medium text-cream/60 hover:text-cream">
              {t("parties")}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-cream/65">{t("emptyEvents")}</p>
            ) : (
              upcoming.map((event) => {
                const reserved = liveGuestCount(event.reservations);
                return (
                  <div key={event.id} className="rounded-xl border border-line px-4 py-3">
                    <p className="text-base font-bold tracking-tight text-cream">{event.title}</p>
                    <p className="mt-1 text-xs font-semibold text-cream/70">
                      {event.artist.trim() || context.venue.name}
                    </p>
                    <p className="mt-1 text-sm text-cream/65">{formatDateTime(event.startsAt, locale)}</p>
                    <p className="mt-1 text-sm text-cream/55">
                      {t("sold")}: {reserved}/{event.capacity}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <StatsDashboard reservations={reservations} period={period} basePath="/dashboard" locale={locale} />
    </div>
  );
}
