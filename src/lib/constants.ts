export const APP_NAME = "Ulaznice";
export const APP_HOST = "ulaznice.rs";

export const VENUE_TYPES = ["CLUB", "CAFE", "RESTAURANT", "BAR"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "ulaznice",
  "mesto",
  "www",
  "mail",
  "dashboard",
  "login",
  "register",
  "tickets",
  "v",
]);

export const MAX_GUESTS = 20;
export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "DRINKS"] as const;
export type MealType = (typeof MEAL_TYPES)[number];
export const MEAL_HOURS: Record<MealType, number> = {
  BREAKFAST: 9,
  LUNCH: 13,
  DINNER: 20,
  DRINKS: 21,
};

export const PAYMENT_METHODS = ["ONSITE"] as const;
export const ONLINE_PAYMENTS_ENABLED = false;
export const PAYMENT_STATUSES = ["PAID", "UNPAID"] as const;
export const RESERVATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
export const STAFF_ROLES = ["OWNER", "STAFF"] as const;

export const MENU_KINDS = ["FOOD", "DRINK", "TICKET", "OTHER"] as const;
export type MenuKind = (typeof MENU_KINDS)[number];

export const PROMO_KINDS = ["HAPPY_HOUR", "DISCOUNT", "MENU", "NIGHT", "OTHER"] as const;
export type PromoKind = (typeof PROMO_KINDS)[number];

export const REVIEW_ASPECTS = ["FOOD", "DRINKS", "NIGHT"] as const;
export type ReviewAspect = (typeof REVIEW_ASPECTS)[number];

export function reviewAspectsForType(type: string): ReviewAspect[] {
  if (type === "CLUB" || type === "BAR") return ["NIGHT", "DRINKS"];
  if (type === "CAFE") return ["DRINKS", "FOOD"];
  return ["FOOD", "DRINKS"];
}

export const ROOT_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ulaznice.rs",
  "www.ulaznice.rs",
  "mesto.rs",
  "www.mesto.rs",
]);
