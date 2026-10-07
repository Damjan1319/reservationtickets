"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDateTime, localDayKey } from "@/lib/utils";

export type GuestReservationItem = {
  id: string;
  kind: string;
  status: string;
  guests: number;
  paymentStatus: string;
  mealType: string | null;
  visitAt: string;
  venueName: string;
  eventTitle: string | null;
};

export function GuestReservations({ items }: { items: GuestReservationItem[] }) {
  const t = useTranslations("ticket");
  const tb = useTranslations("booking");
  const locale = useLocale();
  const [date, setDate] = useState("");

  const filtered = useMemo(() => {
    if (!date) return items;
    return items.filter((item) => localDayKey(new Date(item.visitAt)) === date);
  }, [items, date]);

  function statusText(item: GuestReservationItem) {
    if (item.status === "PENDING") {
      return item.kind === "TABLE" ? t("waitingConfirmTable") : t("waitingConfirm");
    }
    if (item.status === "CANCELLED") return t("cancelled");
    if (item.kind === "TABLE") return `${t("kindTable")} · ${item.guests} ${t("guests").toLowerCase()}`;
    return `${item.paymentStatus === "PAID" ? t("paid") : t("unpaid")} · ${item.guests} ${t("guests").toLowerCase()}`;
  }

  return (
    <div>
      <form
        className="mt-6 flex flex-wrap items-end gap-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="min-w-44 flex-1 space-y-2">
          <span className="text-sm text-muted">{t("filterDate")}</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-paper-line bg-paper px-4 py-3 font-semibold text-paper-text outline-none [color-scheme:light] focus:border-paper-text"
          />
        </label>
        {date ? (
          <button type="button" className="btn btn-ghost !px-4" onClick={() => setDate("")}>
            {t("clearDate")}
          </button>
        ) : null}
      </form>

      {filtered.length === 0 ? (
        <p className="mt-8 text-muted">{items.length === 0 ? t("empty") : t("emptyDate")}</p>
      ) : (
        <div className="mt-8 space-y-4">
          {filtered.map((item) => {
            const title =
              item.kind === "TABLE" && item.mealType
                ? `${t("table")} · ${tb(`meals.${item.mealType}`)}`
                : (item.eventTitle ?? item.venueName);
            return (
              <Link
                key={item.id}
                href={`/tickets/${item.id}`}
                className="block rounded-2xl border border-paper-line bg-paper p-5 text-paper-text hover:border-paper-text/25"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-paper-muted">{item.venueName}</p>
                  <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-xs text-paper-muted">
                    {item.kind === "TABLE" ? t("kindTable") : t("kindEvent")}
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-paper-muted">{formatDateTime(new Date(item.visitAt), locale)}</p>
                <p className="mt-3 text-sm text-paper-muted">{statusText(item)}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
