export const VENUE_TZ = "Europe/Belgrade";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dayKeyInTz(date: Date, timeZone = VENUE_TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function clockInTz(date: Date, timeZone = VENUE_TZ) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  return get("hour") * 60 + get("minute");
}

export function todayKey(timeZone = VENUE_TZ) {
  return dayKeyInTz(new Date(), timeZone);
}

function minutesFromClock(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function isWithinHours(opensAt: string, closesAt: string, date: Date) {
  const open = minutesFromClock(opensAt);
  const close = minutesFromClock(closesAt);
  if (open == null || close == null) return true;
  const now = clockInTz(date);
  if (open === close) return true;
  if (close < open) return now >= open || now < close;
  return now >= open && now < close;
}

export function timeIsWithinHours(opensAt: string, closesAt: string, timeValue: string) {
  const open = minutesFromClock(opensAt);
  const close = minutesFromClock(closesAt);
  const at = minutesFromClock(timeValue);
  if (open == null || close == null || at == null) return true;
  if (open === close) return true;
  if (close < open) return at >= open || at < close;
  return at >= open && at < close;
}

export function belgradeToDate(dateValue: string, timeValue: string) {
  const naive = `${dateValue}T${timeValue}:00`;
  const asUtc = Date.parse(`${naive}Z`);
  if (Number.isNaN(asUtc)) return null;
  const shown = new Date(asUtc).toLocaleString("sv-SE", { timeZone: VENUE_TZ }).replace(" ", "T");
  const shownUtc = Date.parse(`${shown}Z`);
  if (Number.isNaN(shownUtc)) return null;
  return new Date(asUtc + (asUtc - shownUtc));
}

export function formatClock(hours: number, minutes: number) {
  return `${pad(hours)}:${pad(minutes)}`;
}
