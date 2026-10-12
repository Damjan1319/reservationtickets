import { reviewAspectsForType, type ReviewAspect } from "@/lib/constants";

export type ReviewScores = {
  food: number | null;
  drinks: number | null;
  night: number | null;
};

export type ReviewSummary = {
  count: number;
  overall: number | null;
  food: number | null;
  drinks: number | null;
  night: number | null;
};

function mean(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

export function summarizeReviews(reviews: ReviewScores[]): ReviewSummary {
  const pick = (key: keyof ReviewScores) =>
    mean(reviews.map((item) => item[key]).filter((value): value is number => value != null && value >= 1));
  const food = pick("food");
  const drinks = pick("drinks");
  const night = pick("night");
  const overall = mean([food, drinks, night].filter((value): value is number => value != null));
  return { count: reviews.length, overall, food, drinks, night };
}

export function parseScore(raw: FormDataEntryValue | null) {
  const value = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isInteger(value) || value < 1 || value > 5) return null;
  return value;
}

export function scoresForAspects(type: string, data: FormData): ReviewScores {
  const allowed = new Set(reviewAspectsForType(type));
  const read = (aspect: ReviewAspect, key: keyof ReviewScores) =>
    allowed.has(aspect) ? parseScore(data.get(key)) : null;
  return {
    food: read("FOOD", "food"),
    drinks: read("DRINKS", "drinks"),
    night: read("NIGHT", "night"),
  };
}

export function hasRequiredScores(type: string, scores: ReviewScores) {
  const allowed = reviewAspectsForType(type);
  return allowed.every((aspect) => {
    if (aspect === "FOOD") return scores.food != null;
    if (aspect === "DRINKS") return scores.drinks != null;
    return scores.night != null;
  });
}
