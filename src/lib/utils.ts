import { MEAL_HOURS, type MealType, RESERVED_SLUGS } from "@/lib/constants";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export function isValidSlug(slug: string) {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(slug) && !RESERVED_SLUGS.has(slug);
}

export function normalizePib(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidPib(value: string) {
  return /^\d{9}$/.test(normalizePib(value));
}

export function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidProofUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function formatMoney(amount: number, locale: string) {
  const formatted = new Intl.NumberFormat(locale === "sr" ? "sr-RS" : "en-US").format(amount);
  return `${formatted} RSD`;
}

export function formatDateTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-RS" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-RS" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateLong(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-RS" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function venuePublicHost(slug: string) {
  return `${slug}.ulaznice.rs`;
}

const VENUE_COVERS: Record<string, string> = {
  CLUB: "/venues/club.jpg",
  CAFE: "/venues/cafe.jpg",
  RESTAURANT: "/venues/restaurant.jpg",
  BAR: "/venues/bar.jpg",
};

export function venueCover(type: string, coverUrl?: string | null) {
  if (coverUrl && !coverUrl.startsWith("/uploads/")) return coverUrl;
  return VENUE_COVERS[type] ?? VENUE_COVERS.CLUB;
}

export function remainingSpots(capacity: number, reservedGuests: number) {
  return Math.max(0, capacity - reservedGuests);
}

export function liveGuestCount(reservations: Array<{ guests: number; status?: string | null }>) {
  return reservations
    .filter((item) => item.status !== "CANCELLED")
    .reduce((sum, item) => sum + item.guests, 0);
}

export function parseQrPayload(raw: string) {
  const value = raw.trim();
  if (value.startsWith("ULZ:")) return value.slice(4);
  try {
    const url = new URL(value);
    const token = url.searchParams.get("token") ?? url.pathname.split("/").filter(Boolean).pop();
    return token ?? value;
  } catch {
    return value;
  }
}

export function createQrToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function mealVisitAt(dateValue: string, mealType: MealType) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(MEAL_HOURS[mealType], 0, 0, 0);
  return date;
}

export function combineDateTime(dateValue: string, timeValue: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeValue.trim());
  if (!match) return null;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

export function todayInputValue() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function localDayKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatTime(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "sr" ? "sr-RS" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function hourKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultMealTime(mealType: MealType) {
  return `${String(MEAL_HOURS[mealType]).padStart(2, "0")}:00`;
}
