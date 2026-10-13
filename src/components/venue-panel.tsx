"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BookingForm } from "@/components/booking-form";
import { cn, formatDateTime, formatMoney, remainingSpots } from "@/lib/utils";

type Tab = "menu" | "events" | "reviews";

export type VenueEventPick = {
  id: string;
  title: string;
  artist: string;
  startsAt: string;
  price: number;
  capacity: number;
  reservedGuests: number;
};

function firstTab(initial: string | undefined, menuCount: number, eventCount: number): Tab {
  if (initial === "menu" && menuCount > 0) return "menu";
  if (initial === "events" && eventCount > 0) return "events";
  if (initial === "reviews") return "reviews";
  if (menuCount > 0) return "menu";
  if (eventCount > 0) return "events";
  return "reviews";
}

export function VenuePanel({
  menu,
  reviews,
  events,
  menuCount,
  eventCount,
  reviewCount,
  initialTab,
  tableAside,
  loggedIn,
  loginHref,
  initialGuests,
}: {
  menu: ReactNode;
  reviews: ReactNode;
  events: VenueEventPick[];
  menuCount: number;
  eventCount: number;
  reviewCount: number;
  initialTab?: string;
  tableAside: ReactNode;
  loggedIn: boolean;
  loginHref: string;
  initialGuests?: number;
}) {
  const t = useTranslations("venue");
  const to = useTranslations("offer");
  const tr = useTranslations("review");
  const te = useTranslations("event");
  const tb = useTranslations("booking");
  const tn = useTranslations("nav");
  const ts = useTranslations("search");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>(firstTab(initialTab, menuCount, eventCount));
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const selected = events.find((item) => item.id === eventId) ?? events[0] ?? null;
  const remaining = selected ? remainingSpots(selected.capacity, selected.reservedGuests) : 0;

  const tabs: Array<{ id: Tab; label: string; count?: number; hidden?: boolean }> = [
    { id: "menu", label: to("menusPublic"), count: menuCount, hidden: menuCount === 0 },
    { id: "events", label: t("upcoming"), count: eventCount, hidden: eventCount === 0 },
    { id: "reviews", label: tr("title"), count: reviewCount },
  ];

  const showAside = tab === "menu" || (tab === "events" && Boolean(selected));

  return (
    <div className={showAside ? "grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:gap-12" : ""}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label={t("sections")}>
            {tabs
              .filter((item) => !item.hidden)
              .map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "shrink-0 border-b-2 px-3 py-3 text-sm font-semibold sm:px-4",
                    tab === item.id
                      ? "border-cream text-cream"
                      : "border-transparent text-cream/55 hover:text-cream/85",
                  )}
                >
                  {item.label}
                  {item.count ? (
                    <span className="ml-1.5 font-medium text-cream/45">{item.count}</span>
                  ) : null}
                </button>
              ))}
          </nav>
          {tab === "menu" ? (
            <a
              href="#rezervacija"
              className="mb-2 inline-flex rounded-lg bg-cream px-3 py-2 text-sm font-semibold text-bg lg:hidden"
            >
              {t("tableTitle")}
            </a>
          ) : null}
          {tab === "events" && selected ? (
            <a
              href="#karta"
              className="mb-2 inline-flex rounded-lg bg-cream px-3 py-2 text-sm font-semibold text-bg lg:hidden"
            >
              {ts("takeTicket")}
            </a>
          ) : null}
        </div>

        <div className="pt-6">
          {tab === "menu" ? menu : null}
          {tab === "events" ? (
            events.length === 0 ? (
              <p className="text-cream/70">{t("noEvents")}</p>
            ) : (
              <div className="grid gap-3">
                {events.map((item) => {
                  const left = remainingSpots(item.capacity, item.reservedGuests);
                  const active = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEventId(item.id)}
                      className={cn(
                        "rounded-2xl border p-5 text-left transition",
                        active
                          ? "border-cream bg-surface text-cream"
                          : "border-line bg-surface/60 text-cream hover:border-cream/35",
                      )}
                    >
                      <p className="text-xs font-semibold text-cream/70">
                        {formatDateTime(new Date(item.startsAt), locale)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight">{item.title}</h3>
                      <p className="mt-1.5 text-sm font-medium text-cream/80">
                        {te("act")} · {item.artist}
                      </p>
                      <div className="mt-4 flex items-end justify-between text-sm">
                        <p className="font-semibold">
                          {formatMoney(item.price, locale)}
                          <span className="font-medium text-cream/60"> / {te("perPerson")}</span>
                        </p>
                        <p className={left === 0 ? "font-semibold text-danger" : "font-medium text-cream/70"}>
                          {left === 0 ? te("soldOut") : `${left} · ${te("spots")}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : null}
          {tab === "reviews" ? reviews : null}
        </div>
      </div>

      {tab === "menu" ? (
        <aside
          id="rezervacija"
          className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6 lg:sticky lg:top-24"
        >
          {tableAside}
        </aside>
      ) : null}

      {tab === "events" && selected ? (
        <aside
          id="karta"
          className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6 lg:sticky lg:top-24"
        >
          <h2 className="text-lg font-bold">{ts("takeTicket")}</h2>
          <p className="mt-1 text-sm font-semibold">{selected.title}</p>
          <p className="mt-1 text-sm font-medium text-paper-muted">
            {formatDateTime(new Date(selected.startsAt), locale)}
          </p>
          {loggedIn ? (
            <div className="mt-6">
              <BookingForm
                key={selected.id}
                eventId={selected.id}
                price={selected.price}
                remaining={remaining}
                locale={locale}
                initialGuests={initialGuests}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-paper-muted">{tb("needLogin")}</p>
              <Link href={loginHref} className="btn btn-primary">
                {tn("login")}
              </Link>
            </div>
          )}
        </aside>
      ) : null}
    </div>
  );
}
