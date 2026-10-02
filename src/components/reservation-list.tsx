import { getLocale, getTranslations } from "next-intl/server";
import { formatDateTime } from "@/lib/utils";

type Item = {
  id: string;
  kind: string;
  mealType: string | null;
  guests: number;
  checkedInCount: number;
  paymentStatus: string;
  visitAt: Date;
  user: { name: string; email: string };
  event: { title: string } | null;
};

export async function ReservationList({ items }: { items: Item[] }) {
  const t = await getTranslations("dashboard");
  const tt = await getTranslations("ticket");
  const tb = await getTranslations("booking");
  const locale = await getLocale();

  if (items.length === 0) {
    return <p className="mt-8 text-muted">{t("emptyReservations")}</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => {
        const title =
          item.kind === "TABLE" && item.mealType
            ? `${tt("table")} · ${tb(`meals.${item.mealType}`)}`
            : (item.event?.title ?? "—");
        return (
          <article key={item.id} className="rounded-2xl border border-paper-line bg-paper p-4 text-paper-text">
            <p className="text-base font-semibold">{title}</p>
            <p className="text-sm text-paper-muted">{formatDateTime(item.visitAt, locale)}</p>
            <p className="mt-2 text-sm">
              {item.user.name} · {item.user.email}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span>
                {tt("guests")}: {item.guests}
              </span>
              <span>
                {t("inside")}: {item.checkedInCount}/{item.guests}
              </span>
              <span className={item.paymentStatus === "PAID" ? "text-success" : "text-danger"}>
                {item.paymentStatus === "PAID" ? tt("paid") : tt("unpaid")}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
