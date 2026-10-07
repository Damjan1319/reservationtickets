"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  confirmReservation,
  cancelReservation,
  getDoorList,
  markReservationPaid,
  markTableArrived,
} from "@/app/actions/reservation";
import { Scanner } from "@/components/scanner";
import type { DoorItem } from "@/lib/door";
import { cn, formatTime } from "@/lib/utils";

function cacheKey(venueId: string) {
  return `door-list:${venueId}`;
}

export function DoorBoard({
  venueId,
  venueName,
  locale,
  initialItems,
}: {
  venueId: string;
  venueName: string;
  locale: string;
  initialItems: DoorItem[];
}) {
  const t = useTranslations("scan");
  const tt = useTranslations("ticket");
  const tb = useTranslations("booking");
  const td = useTranslations("dashboard");
  const [tab, setTab] = useState<"camera" | "list">("camera");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      localStorage.setItem(cacheKey(venueId), JSON.stringify({ at: Date.now(), items }));
    } catch {
      /* ignore */
    }
  }, [items, venueId]);

  useEffect(() => {
    if (initialItems.length > 0) return;
    try {
      const raw = localStorage.getItem(cacheKey(venueId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as { items?: DoorItem[] };
      if (parsed.items?.length) setItems(parsed.items);
    } catch {
      /* ignore */
    }
  }, [initialItems.length, venueId]);

  function refresh() {
    startTransition(async () => {
      const result = await getDoorList();
      if (result.ok) setItems(result.items);
    });
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.guestName.toLowerCase().includes(q) ||
        item.guestEmail.toLowerCase().includes(q) ||
        (item.eventTitle ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const waiting = items.filter((item) => item.status === "PENDING").length;
  const inside = items.filter((item) => item.checkedIn).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-cream">{venueName}</p>
          <p className="text-xs text-cream/55">
            {t("todayGuestsHint")}: {items.length} · {t("todayInsideHint")}: {inside}
            {waiting ? ` · ${waiting}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 rounded-full border border-line p-0.5">
          <button
            type="button"
            onClick={() => setTab("camera")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              tab === "camera" ? "bg-paper text-paper-text" : "text-cream/80",
            )}
          >
            {t("title")}
          </button>
          <button
            type="button"
            onClick={() => setTab("list")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              tab === "list" ? "bg-paper text-paper-text" : "text-cream/80",
            )}
          >
            {t("toList")}
            {waiting ? ` ${waiting}` : ""}
          </button>
        </div>
      </div>

      {tab === "camera" ? (
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">
          <Scanner locale={locale} onNeedList={() => setTab("list")} />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={td("searchGuests")}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-4 py-3 text-cream outline-none"
            />
            <button type="button" onClick={refresh} disabled={pending} className="btn btn-ghost !px-4">
              {pending ? "…" : t("lookup")}
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto">
            {visible.length === 0 ? (
              <p className="pt-8 text-center text-sm text-cream/65">{t("listEmpty")}</p>
            ) : (
              visible.map((item) => {
                const title =
                  item.kind === "TABLE" && item.mealType
                    ? `${tt("table")} · ${tb(`meals.${item.mealType}`)}`
                    : (item.eventTitle ?? tt("kindEvent"));
                return (
                  <article key={item.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-bold tracking-tight text-cream">{item.guestName}</p>
                        <p className="text-sm text-cream/60">{item.guestEmail}</p>
                        <p className="mt-1 text-sm text-cream/75">
                          {title} · {item.guests} · {formatTime(new Date(item.visitAt), locale)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          item.status === "PENDING"
                            ? "bg-paper text-paper-text"
                            : item.checkedIn
                              ? "border border-line text-cream/55"
                              : "border border-cream/35 text-cream",
                        )}
                      >
                        {item.status === "PENDING"
                          ? tt("statusPending")
                          : item.checkedIn
                            ? tt("statusInside")
                            : tt("statusConfirmed")}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            disabled={pending}
                            className="btn btn-primary !px-4 !py-2"
                            onClick={() =>
                              startTransition(async () => {
                                await confirmReservation(item.id);
                                refresh();
                              })
                            }
                          >
                            {td("confirmBooking")}
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            className="btn btn-ghost !px-4 !py-2"
                            onClick={() =>
                              startTransition(async () => {
                                await cancelReservation(item.id);
                                refresh();
                              })
                            }
                          >
                            {td("cancelBooking")}
                          </button>
                        </>
                      ) : null}
                      {item.status === "CONFIRMED" && !item.checkedIn && item.kind === "TABLE" ? (
                        <button
                          type="button"
                          disabled={pending}
                          className="btn btn-primary !px-4 !py-2"
                          onClick={() =>
                            startTransition(async () => {
                              await markTableArrived(item.id);
                              refresh();
                            })
                          }
                        >
                          {t("doCheckIn")}
                        </button>
                      ) : null}
                      {item.status === "CONFIRMED" && item.paymentStatus !== "PAID" ? (
                        <button
                          type="button"
                          disabled={pending}
                          className="btn btn-ghost !px-4 !py-2"
                          onClick={() =>
                            startTransition(async () => {
                              await markReservationPaid(item.id);
                              refresh();
                            })
                          }
                        >
                          {t("markPaid")}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
