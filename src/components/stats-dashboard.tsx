import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AdminChart } from "@/components/admin-chart";
import { CopyEmails } from "@/components/copy-emails";
import { StatCard } from "@/components/stat-card";
import { chartDays, computeStats, PERIODS, type Period, type StatsReservation } from "@/lib/stats";
import { cn, localDayKey } from "@/lib/utils";

export async function StatsDashboard({
  reservations,
  period,
  basePath,
}: {
  reservations: StatsReservation[];
  period: Period;
  basePath: string;
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
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
              period === value ? "bg-paper text-paper-text" : "border border-line text-muted hover:text-cream",
            )}
          >
            {t(`period.${value}`)}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("statEmails")} value={stats.emails.length} hint={t("statEmailsHint")} tone="both" />
        <StatCard label={t("statPeriod")} value={stats.inPeriod.length} hint={t("statPeriodHint")} />
        <StatCard label={t("statSold")} value={stats.soldTickets} hint={t("statSoldHint")} tone="event" />
        <StatCard label={t("statArrived")} value={stats.arrived} hint={t("statArrivedHint")} tone="table" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6">
          <h2 className="text-xl font-semibold tracking-tight">{t("chartTitle")}</h2>
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
            <h2 className="text-xl font-semibold tracking-tight">{t("emailsTitle")}</h2>
            <CopyEmails emails={stats.emails} />
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
