import { localDayKey } from "@/lib/utils";

export type DayOccupancy = { tables: number; events: number; guests: number };

export function parseMonth(value?: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (match) {
    return { year: Number(match[1]), month: Number(match[2]) };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function monthLabel(year: number, month: number, locale: string) {
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-RS" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const pad = (first.getDay() + 6) % 7;
  const lastDate = new Date(year, month, 0).getDate();
  const cells: Array<{ date: number; key: string } | null> = [];
  for (let i = 0; i < pad; i += 1) cells.push(null);
  for (let day = 1; day <= lastDate; day += 1) {
    cells.push({ date: day, key: localDayKey(new Date(year, month - 1, day)) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function occupancyByDay(
  reservations: { kind: string; guests: number; visitAt: Date }[],
) {
  const map = new Map<string, DayOccupancy>();
  for (const item of reservations) {
    const key = localDayKey(item.visitAt);
    const current = map.get(key) ?? { tables: 0, events: 0, guests: 0 };
    if (item.kind === "TABLE") current.tables += 1;
    else current.events += 1;
    current.guests += item.guests;
    map.set(key, current);
  }
  return map;
}

export function dayTone(info?: DayOccupancy) {
  if (!info || (info.tables === 0 && info.events === 0)) return "free";
  if (info.tables && info.events) return "both";
  if (info.events) return "event";
  return "table";
}
