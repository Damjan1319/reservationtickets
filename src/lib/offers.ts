export function isPromoLive(promo: {
  active: boolean;
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
}) {
  if (!promo.active) return false;
  const now = Date.now();
  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) return false;
  if (promo.endsAt && new Date(promo.endsAt).getTime() < now) return false;
  return true;
}

export function parseOptionalDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date;
}
