import { getLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Scanner } from "@/components/scanner";
import { StatCard } from "@/components/stat-card";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";

export default async function ScanPage() {
  const t = await getTranslations("scan");
  const td = await getTranslations("dashboard");
  const locale = await getLocale();
  const context = await getStaffContext();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const today = context
    ? await prisma.reservation.findMany({
        where: { venueId: context.venue.id, visitAt: { gte: start } },
        include: { tickets: { select: { checkedInAt: true } } },
      })
    : [];

  const guests = today.reduce((sum, item) => sum + item.guests, 0);
  const inside = today.reduce((sum, item) => {
    if (item.kind === "EVENT") {
      return sum + item.tickets.filter((ticket) => ticket.checkedInAt).length;
    }
    return sum + item.checkedInCount;
  }, 0);
  const unpaid = today.filter((item) => item.paymentStatus === "UNPAID").length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={td("scan")} title={t("title")} description={t("subtitle")} />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("todayGuests")} value={guests} hint={t("todayGuestsHint")} />
        <StatCard label={td("statsInside")} value={inside} hint={t("todayInsideHint")} />
        <StatCard label={td("statsUnpaid")} value={unpaid} hint={t("todayUnpaidHint")} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-paper-line bg-paper p-4 text-paper-text sm:p-6">
        <p className="mb-4 text-sm text-paper-muted">{t("phoneHint")}</p>
        <Scanner locale={locale} />
      </div>
    </div>
  );
}
