import { MAX_GUESTS, MEAL_TYPES, VENUE_TYPES, type MealType } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { todayKey, dayKeyInTz } from "@/lib/time";
import { isPromoLive } from "@/lib/offers";
import { summarizeReviews } from "@/lib/reviews";
import { liveGuestCount, remainingSpots, venueCover } from "@/lib/utils";

export const SEARCH_KINDS = ["all", "table", "event"] as const;
export type SearchKind = (typeof SEARCH_KINDS)[number];

export const SEARCH_SORTS = ["recommended", "seats", "events"] as const;
export type SearchSort = (typeof SEARCH_SORTS)[number];

export const SEARCH_OCCASIONS = ["KAFA", "LUNCH", "DINNER", "DRINKS", "EVENTS"] as const;
export type SearchOccasion = (typeof SEARCH_OCCASIONS)[number];

const OCCASION_MAP: Record<
  SearchOccasion,
  { types?: string[]; meal?: MealType; mode: "table" | "event" }
> = {
  KAFA: { types: ["CAFE"], meal: "DRINKS", mode: "table" },
  LUNCH: { types: ["RESTAURANT", "CAFE"], meal: "LUNCH", mode: "table" },
  DINNER: { types: ["RESTAURANT", "CAFE"], meal: "DINNER", mode: "table" },
  DRINKS: { types: ["BAR", "CAFE", "RESTAURANT"], meal: "DRINKS", mode: "table" },
  EVENTS: { mode: "event" },
};

export function normalizeOccasion(value?: string) {
  if (value === "NIGHT") return "EVENTS";
  if (SEARCH_OCCASIONS.includes(value as SearchOccasion)) return value as SearchOccasion;
  return "";
}

export function occasionFilter(occasion: string) {
  const key = normalizeOccasion(occasion);
  if (!key) return null;
  return OCCASION_MAP[key];
}

export function isEventIntent(query: Pick<SearchQuery, "kind" | "occasion">) {
  return query.kind === "event" || occasionFilter(query.occasion)?.mode === "event";
}

export function isTableIntent(query: Pick<SearchQuery, "kind" | "occasion">) {
  return query.kind === "table" || occasionFilter(query.occasion)?.mode === "table";
}

export function withOccasion(query: SearchQuery, occasion: string): Partial<SearchQuery> {
  const occ = occasionFilter(occasion);
  const kind = !occasion ? "all" : occ?.mode === "event" ? "event" : occ?.mode === "table" ? "table" : query.kind;
  const type = occ?.types?.length && query.type && !occ.types.includes(query.type) ? "" : query.type;
  return { occasion, kind, type };
}

export type SearchQuery = {
  city: string;
  date: string;
  guests: number;
  type: string;
  kind: SearchKind;
  occasion: string;
  sort: SearchSort;
  available: boolean;
};

export type SearchEvent = {
  id: string;
  title: string;
  startsAt: string;
  price: number;
  left: number;
};

export type SearchVenue = {
  id: string;
  name: string;
  slug: string;
  type: string;
  city: string;
  address: string;
  description: string;
  coverUrl: string;
  opensAt: string;
  closesAt: string;
  closed: boolean;
  tableCapacity: number;
  tableLeft: number | null;
  eventCount: number;
  nextEvent: SearchEvent | null;
  events: SearchEvent[];
  bookableTable: boolean;
  bookableEvent: boolean;
  bookable: boolean;
  promoTitle: string | null;
  hasMenu: boolean;
  hasEventOnDate: boolean;
  ratingAvg: number | null;
  ratingCount: number;
};

type RawParams = {
  city?: string;
  date?: string;
  guests?: string;
  type?: string;
  kind?: string;
  occasion?: string;
  sort?: string;
  available?: string;
};

export function parseSearchParams(raw: RawParams): SearchQuery {
  const today = todayKey();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw.date ?? "") && (raw.date as string) >= today ? (raw.date as string) : today;
  const guests = Math.min(MAX_GUESTS, Math.max(1, Number.parseInt(raw.guests ?? "2", 10) || 2));
  const occasion = normalizeOccasion(raw.occasion);
  const occ = occasionFilter(occasion);
  const type = VENUE_TYPES.includes(raw.type as (typeof VENUE_TYPES)[number]) ? (raw.type as string) : "";
  let kind = SEARCH_KINDS.includes(raw.kind as SearchKind) ? (raw.kind as SearchKind) : "all";
  if (occ?.mode === "event") kind = "event";
  else if (occ?.mode === "table") kind = "table";
  const sort = SEARCH_SORTS.includes(raw.sort as SearchSort) ? (raw.sort as SearchSort) : "recommended";
  const available = raw.available === "1" || raw.available === "on";
  return {
    city: (raw.city ?? "").trim().slice(0, 80),
    date,
    guests,
    type: occ?.types?.length && type && !occ.types.includes(type) ? "" : type,
    kind,
    occasion,
    sort,
    available,
  };
}

export function searchHref(query: Partial<SearchQuery>) {
  const params = new URLSearchParams();
  if (query.city) params.set("city", query.city);
  if (query.date) params.set("date", query.date);
  if (query.guests) params.set("guests", String(query.guests));
  if (query.type) params.set("type", query.type);
  if (query.kind && query.kind !== "all") params.set("kind", query.kind);
  if (query.occasion) params.set("occasion", query.occasion);
  if (query.sort && query.sort !== "recommended") params.set("sort", query.sort);
  if (query.available) params.set("available", "1");
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function venueHref(
  slug: string,
  query: Pick<SearchQuery, "date" | "guests"> & { occasion?: string },
  tab?: "menu" | "events",
) {
  const params = new URLSearchParams();
  if (query.date) params.set("date", query.date);
  if (query.guests) params.set("guests", String(query.guests));
  const meal = occasionFilter(query.occasion ?? "")?.meal;
  if (meal) params.set("meal", meal);
  if (tab) params.set("tab", tab);
  const qs = params.toString();
  return qs ? `/v/${slug}?${qs}` : `/v/${slug}`;
}

export function resultHref(venue: SearchVenue, query: SearchQuery) {
  if (isEventIntent(query)) {
    if (venue.nextEvent) {
      const params = new URLSearchParams();
      if (query.guests) params.set("guests", String(query.guests));
      return `/v/${venue.slug}/events/${venue.nextEvent.id}?${params.toString()}`;
    }
    return venueHref(venue.slug, query, "events");
  }
  if (isTableIntent(query)) return venueHref(venue.slug, query, "menu");
  return venueHref(venue.slug, query);
}

export async function listCities() {
  const rows = await prisma.venue.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return rows.map((row) => row.city).filter(Boolean);
}

export async function listDestinations() {
  const venues = await prisma.venue.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: { city: true, type: true, coverUrl: true },
    orderBy: { name: "asc" },
  });
  const map = new Map<string, { city: string; count: number; cover: string }>();
  for (const venue of venues) {
    const existing = map.get(venue.city);
    if (!existing) {
      map.set(venue.city, { city: venue.city, count: 1, cover: venueCover(venue.type, venue.coverUrl) });
    } else {
      existing.count += 1;
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, "sr"));
}

function tableLeftForDay(
  tableCapacity: number,
  reservations: Array<{ guests: number; visitAt: Date; mealType: string | null }>,
  day: string,
  meal?: MealType,
) {
  if (tableCapacity <= 0) return null;
  const taken: Record<string, number> = {};
  for (const row of reservations) {
    if (dayKeyInTz(row.visitAt) !== day) continue;
    const slot = row.mealType ?? "DINNER";
    taken[slot] = (taken[slot] ?? 0) + row.guests;
  }
  const slots = meal ? [meal] : [...MEAL_TYPES];
  return Math.max(...slots.map((slot) => tableCapacity - (taken[slot] ?? 0)));
}

export async function searchVenues(query: SearchQuery): Promise<SearchVenue[]> {
  const occasion = occasionFilter(query.occasion);
  const typeFilter = query.type
    ? [query.type]
    : occasion
      ? occasion.types
      : undefined;
  const venues = await prisma.venue.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(typeFilter && typeFilter.length > 0 ? { type: { in: typeFilter } } : {}),
      ...(query.city ? { city: { contains: query.city, mode: "insensitive" } } : {}),
    },
    include: {
      events: {
        where: { startsAt: { gte: new Date() } },
        orderBy: { startsAt: "asc" },
        include: { reservations: { select: { guests: true, status: true } } },
      },
      reservations: {
        where: { kind: "TABLE", status: { not: "CANCELLED" } },
        select: { guests: true, visitAt: true, mealType: true },
      },
      promotions: {
        where: { active: true },
        select: { title: true, startsAt: true, endsAt: true, active: true },
      },
      menus: {
        where: { published: true },
        select: { id: true, items: { where: { available: true }, select: { id: true } } },
      },
      reviews: { select: { food: true, drinks: true, night: true } },
    },
    orderBy: { name: "asc" },
  });

  const mapped = venues.map((venue) => {
    const events: SearchEvent[] = venue.events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      price: event.price,
      left: remainingSpots(event.capacity, liveGuestCount(event.reservations)),
    }));
    const todayEvents = events.filter((event) => dayKeyInTz(new Date(event.startsAt)) === query.date);
    const fitting =
      todayEvents.find((event) => event.left >= query.guests) ??
      events.find((event) => event.left >= query.guests) ??
      todayEvents[0] ??
      events[0] ??
      null;
    const ratings = summarizeReviews(venue.reviews);
    const tableLeft = tableLeftForDay(venue.tableCapacity, venue.reservations, query.date, occasion?.meal);
    const bookableTable = !venue.closed && (tableLeft == null || tableLeft >= query.guests);
    const bookableEvent = Boolean(fitting && fitting.left >= query.guests);
    const eventMode = isEventIntent(query);
    const tableMode = isTableIntent(query);
    const bookable = tableMode ? bookableTable : eventMode ? bookableEvent : bookableTable || bookableEvent;

    return {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      type: venue.type,
      city: venue.city,
      address: venue.address,
      description: venue.description,
      coverUrl: venueCover(venue.type, venue.coverUrl),
      opensAt: venue.opensAt,
      closesAt: venue.closesAt,
      closed: venue.closed,
      tableCapacity: venue.tableCapacity,
      tableLeft,
      eventCount: events.length,
      nextEvent: fitting,
      events: (todayEvents.length > 0 ? todayEvents : events).slice(0, 4),
      bookableTable,
      bookableEvent,
      bookable,
      promoTitle: venue.promotions.find(isPromoLive)?.title ?? null,
      hasMenu: venue.menus.some((menu) => menu.items.length > 0),
      hasEventOnDate: todayEvents.length > 0,
      ratingAvg: ratings.overall,
      ratingCount: ratings.count,
    };
  });

  const filtered = mapped.filter((venue) => {
    if (isEventIntent(query) && venue.eventCount === 0) return false;
    if (query.available && !venue.bookable) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (query.sort === "seats") {
      return (b.tableLeft ?? -1) - (a.tableLeft ?? -1) || a.name.localeCompare(b.name, "sr");
    }
    if (query.sort === "events") {
      return b.eventCount - a.eventCount || a.name.localeCompare(b.name, "sr");
    }
    if (Number(b.bookable) !== Number(a.bookable)) return Number(b.bookable) - Number(a.bookable);
    if (isTableIntent(query)) {
      return Number(b.hasMenu) - Number(a.hasMenu) || a.name.localeCompare(b.name, "sr");
    }
    if (isEventIntent(query)) {
      return Number(b.hasEventOnDate) - Number(a.hasEventOnDate) || b.eventCount - a.eventCount || a.name.localeCompare(b.name, "sr");
    }
    return b.eventCount - a.eventCount || a.name.localeCompare(b.name, "sr");
  });

  return filtered;
}
