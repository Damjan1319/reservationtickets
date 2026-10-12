import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { CreatePromoForm, PromoActions } from "@/components/promo-forms";
import { PageHeader } from "@/components/page-header";
import { isPromoLive } from "@/lib/offers";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPromosPage() {
  const context = await requireStaff();
  if (!context) redirect("/login?callbackUrl=/dashboard/promos");
  const t = await getTranslations("offer");
  const locale = await getLocale();
  const promos = await prisma.promotion.findMany({
    where: { venueId: context.venue.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader title={t("promosTitle")} description={t("promosHint")} />
      <div className="mt-6">
        <CreatePromoForm />
      </div>
      {promos.length === 0 ? (
        <p className="mt-8 text-cream/70">{t("promosEmpty")}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {promos.map((promo) => (
            <article key={promo.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-bold tracking-tight text-cream">{promo.title}</p>
                  <p className="mt-1 text-sm font-medium text-cream/65">
                    {t(`promoKinds.${promo.kind}`)} · {isPromoLive(promo) ? t("live") : t("off")}
                  </p>
                  {promo.body ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/75">{promo.body}</p> : null}
                  <p className="mt-3 text-xs font-medium text-cream/50">
                    {promo.startsAt || promo.endsAt
                      ? `${promo.startsAt ? formatDateTime(promo.startsAt, locale) : "—"} → ${promo.endsAt ? formatDateTime(promo.endsAt, locale) : "—"}`
                      : t("noDates")}
                  </p>
                </div>
                <PromoActions promoId={promo.id} active={promo.active} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
