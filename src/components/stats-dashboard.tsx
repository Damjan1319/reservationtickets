import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminChart } from "@/components/admin-chart";
import { CopyEmails } from "@/components/copy-emails";
import { StatCard } from "@/components/stat-card";
import { chartDays, computeStats, PERIODS, type Period, type StatsReservation } from "@/lib/stats";
import { cn, formatMoney, localDayKey } from "@/lib/utils";

export async function StatsDashboard({
  reservations,
  period,
  basePath,
  locale,
}: {
  reservations: StatsReservation[];
  period: Period;
  basePath: string;
  locale: string;
}) {
  const t = await getTranslations("dashboard");
  const stats = computeStats(reservations, period);
  const days = chartDays(reservations, localDayKey);

  function href(next: Period) {
    if (next === "week") return basePath;
    return `${basePath}?period=${next}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((value) => (
          <Link
            key={value}
            href={href(value)}
            className={cn(
              "rounded-full px-3 py-1 text-[13px] font-semibold transition",
              period === value ? "bg-paper text-paper-text" : "border border-line text-cream/80 hover:bg-surface",
            )}
          >
            {t(`period.${value}`)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("statPeriod")} value={stats.inPeriod.length} hint={t("statPeriodHint")} />
        <StatCard label={t("statEntries")} value={stats.entries} hint={t("statEntriesHint")} />
        <StatCard label={t("statPaid")} value={stats.paidCount} hint={t("statPaidHint")} />
        <StatCard label={t("statEarnings")} value={formatMoney(stats.earnings, locale)} hint={t("statEarningsHint")} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
          <h2 className="text-lg font-bold tracking-tight">{t("chartTitle")}</h2>
          <p className="mt-1 text-sm text-paper-muted">{t("chartHint")}</p>
          <div className="mt-5">
            <AdminChart
              days={days}
              reservationsLabel={t("chartReservations")}
              arrivedLabel={t("chartArrived")}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight">{t("emailsTitle")}</h2>
            <CopyEmails emails={stats.emails} className="text-paper-muted hover:text-paper-text" />
          </div>
          <p className="mt-1 text-sm text-paper-muted">{t("emailsHint")}</p>
          {stats.emails.length === 0 ? (
            <p className="mt-6 text-sm text-paper-muted">{t("emptyReservations")}</p>
          ) : (
            <ul className="mt-5 max-h-72 space-y-2 overflow-auto text-sm">
              {stats.emails.map((email) => (
                <li key={email} className="truncate rounded-xl bg-paper-2 px-3 py-2 text-paper-muted">
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
