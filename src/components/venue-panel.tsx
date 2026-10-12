"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type Tab = "menu" | "events" | "reviews";

export function VenuePanel({
  menu,
  events,
  reviews,
  menuCount,
  eventCount,
  reviewCount,
}: {
  menu: ReactNode;
  events: ReactNode;
  reviews: ReactNode;
  menuCount: number;
  eventCount: number;
  reviewCount: number;
}) {
  const t = useTranslations("venue");
  const to = useTranslations("offer");
  const tr = useTranslations("review");
  const [tab, setTab] = useState<Tab>(menuCount > 0 ? "menu" : eventCount > 0 ? "events" : "reviews");

  const tabs: Array<{ id: Tab; label: string; count?: number; hidden?: boolean }> = [
    { id: "menu", label: to("menusPublic"), count: menuCount, hidden: menuCount === 0 },
    { id: "events", label: t("upcoming"), count: eventCount, hidden: eventCount === 0 },
    { id: "reviews", label: tr("title"), count: reviewCount },
  ];

  return (
    <div>
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
        <a
          href="#rezervacija"
          className="mb-2 inline-flex rounded-lg bg-cream px-3 py-2 text-sm font-semibold text-bg lg:hidden"
        >
          {t("tableTitle")}
        </a>
      </div>

      <div className="pt-6">
        {tab === "menu" ? menu : null}
        {tab === "events" ? events : null}
        {tab === "reviews" ? reviews : null}
      </div>
    </div>
  );
}
