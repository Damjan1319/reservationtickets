import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArriveButton } from "@/components/arrive-button";
import { DecideButtons } from "@/components/decide-buttons";
import { EmailStrip } from "@/components/email-strip";
import { PageHeader } from "@/components/page-header";
import { ReservationCalendar } from "@/components/reservation-calendar";
import { monthKey, monthLabel, occupancyByDay, parseMonth, shiftMonth } from "@/lib/calendar";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";
import { formatTime, hourKey, localDayKey, todayInputValue } from "@/lib/utils";

export default async function TableReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; q?: string }>;
}) {
  const context = await getStaffContext();
  if (!context) return null;
  const t = await getTranslations("dashboard");
  const tb = await getTranslations("booking");
  const locale = await getLocale();
  const { date, q } = await searchParams;
  const day = date || todayInputValue();
  const query = (q ?? "").trim().toLowerCase();

  const all = await prisma.reservation.findMany({
    where: { venueId: context.venue.id },
    include: { user: true },
    orderBy: { visitAt: "asc" },
  });
  const items = all.filter((item) => item.kind === "TABLE");

  const ofDay = items.filter((item) => localDayKey(item.visitAt) === day);
  const filtered = query
    ? ofDay.filter(
        (item) =>
          item.user.email.toLowerCase().includes(query) ||
          item.user.name.toLowerCase().includes(query),
      )
    : ofDay;

  const hours = new Map<string, typeof filtered>();
  for (const item of filtered) {
    const key = hourKey(item.visitAt);
    hours.set(key, [...(hours.get(key) ?? []), item]);
  }

  const emails = [...new Set(filtered.filter((item) => item.status !== "CANCELLED").map((item) => item.user.email))];
  const occupancy = occupancyByDay(all.filter((item) => item.status !== "CANCELLED"));
  const { year, month } = parseMonth(day.slice(0, 7));
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const firstOf = (y: number, m: number) => `${monthKey(y, m)}-01`;

  return (
    <div>
      <PageHeader
        title={t("tables")}
        description={t("tablesHint")}
        action={
          <Link href="/dashboard/create" className="btn btn-primary !px-4 !py-2">
            {t("newBooking")}
          </Link>
        }
      />

      <div className="mt-6">
        <ReservationCalendar
          year={year}
          month={month}
          occupancy={occupancy}
          selected={day}
          dayHref={(key) => `/dashboard/reservations?date=${key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
          prevHref={`/dashboard/reservations?date=${firstOf(prev.year, prev.month)}`}
          nextHref={`/dashboard/reservations?date=${firstOf(next.year, next.month)}`}
          monthTitle={monthLabel(year, month, locale)}
          weekdays={t.raw("calWeekdays") as string[]}
          legendTables={t("calTables")}
          legendEvents={t("calEvents")}
          legendBoth={t("calBoth")}
          legendFree={t("calFree")}
        />
      </div>

      <form className="mt-4 flex gap-2">
        <input type="hidden" name="date" value={day} />
        <input
          name="q"
          defaultValue={q}
          placeholder={t("searchGuests")}
          className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-4 py-3 text-cream outline-none focus:border-cream"
        />
        <button type="submit" className="btn btn-ghost !px-4">
          {t("searchGuests")}
        </button>
      </form>

      <div className="mt-4">
        <EmailStrip label={t("emailsTitle")} empty={t("emptyReservations")} emails={emails} />
      </div>

      <div className="mt-8 space-y-8">
        {hours.size === 0 ? (
          <p className="text-cream/70">{t("emptyReservations")}</p>
        ) : (
          [...hours.entries()].map(([hour, rows]) => (
            <section key={hour}>
              <h2 className="text-base font-bold text-cream">{hour}</h2>
              <div className="mt-3 space-y-3">
                {rows.map((item) => (
                  <article
                    key={item.id}
                    className={
                      item.status === "PENDING"
                        ? "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cream/35 bg-surface p-5 sm:p-6"
                        : "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6"
                    }
                  >
                    <div>
                      <p className="text-xl font-bold tracking-tight text-cream">
                        {item.mealType ? tb(`meals.${item.mealType}`) : t("tables")} · {item.guests}
                      </p>
                      <p className="mt-1 text-sm text-cream/85">
                        {item.user.name}
                        <span className="mt-0.5 block text-cream/55">{item.user.email}</span>
                      </p>
                      <p className="mt-1 text-xs text-cream/55">{formatTime(item.visitAt, locale)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <DecideButtons id={item.id} status={item.status} />
                      {item.status === "CONFIRMED" ? (
                        <ArriveButton id={item.id} arrived={item.checkedInCount >= item.guests} />
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
