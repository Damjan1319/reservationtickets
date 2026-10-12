"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { cn, formatMoney } from "@/lib/utils";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  section: string;
};

type Menu = {
  id: string;
  title: string;
  kind: string;
  items: MenuItem[];
};

type Section = {
  key: string;
  label: string;
  items: MenuItem[];
};

const PREVIEW = 8;

function buildSections(menus: Menu[], kindLabel: (kind: string) => string): Section[] {
  const order: string[] = [];
  const map = new Map<string, Section>();

  for (const menu of menus) {
    for (const item of menu.items) {
      const label = item.section.trim() || menu.title.trim() || kindLabel(menu.kind);
      const key = `${menu.id}:${label}`;
      const existing = map.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        order.push(key);
        map.set(key, { key, label, items: [item] });
      }
    }
  }

  return order.map((key) => map.get(key)!);
}

export function VenueMenu({ menus }: { menus: Menu[] }) {
  const t = useTranslations("offer");
  const locale = useLocale();
  const sections = useMemo(
    () => buildSections(menus, (kind) => t(`menuKinds.${kind}`)),
    [menus, t],
  );
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const visible = filter === "all" ? sections : sections.filter((section) => section.key === filter);
  const total = visible.reduce((sum, section) => sum + section.items.length, 0);
  const truncated = !expanded && total > PREVIEW;

  let left = truncated ? PREVIEW : Number.POSITIVE_INFINITY;
  const shown: Section[] = [];
  for (const section of visible) {
    if (left <= 0) break;
    const items = section.items.slice(0, left);
    left -= items.length;
    if (items.length > 0) shown.push({ ...section, items });
  }

  if (sections.length === 0) return null;

  return (
    <div className="rounded-2xl border border-paper-line bg-paper text-paper-text">
      {sections.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-b border-paper-line px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setExpanded(false);
            }}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold",
              filter === "all" ? "bg-paper-text text-paper" : "bg-white text-paper-muted hover:text-paper-text",
            )}
          >
            {t("allSections")}
          </button>
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                setFilter(section.key);
                setExpanded(false);
              }}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold",
                filter === section.key
                  ? "bg-paper-text text-paper"
                  : "bg-white text-paper-muted hover:text-paper-text",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="px-5 py-2 sm:px-6">
        {shown.map((section) => (
          <section key={section.key} className="border-b border-paper-line py-5 last:border-b-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-paper-muted">{section.label}</h3>
            <ul className="mt-3 space-y-4">
              {section.items.map((item) => (
                <li key={item.id} className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <p className="font-semibold">{item.name}</p>
                    <span className="min-w-6 flex-1 border-b border-dotted border-paper-line" aria-hidden />
                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {item.price > 0 ? formatMoney(item.price, locale) : t("priceAsk")}
                    </p>
                  </div>
                  {item.description ? (
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-paper-muted">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {total > PREVIEW ? (
        <div className="border-t border-paper-line px-5 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="text-sm font-semibold text-paper-text hover:underline"
          >
            {expanded ? t("showLess") : t("showAll", { count: total })}
          </button>
        </div>
      ) : null}
    </div>
  );
}
