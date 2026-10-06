export const VENUE_TYPES = ["CLUB", "CAFE", "RESTAURANT", "BAR"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "ulaznice",
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

export const ROOT_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "ulaznice.rs",
  "www.ulaznice.rs",
]);
