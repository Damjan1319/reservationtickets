"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { saveReview } from "@/app/actions/review";
import { reviewAspectsForType, type ReviewAspect } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ReviewForm({
  venueId,
  venueType,
  initial,
}: {
  venueId: string;
  venueType: string;
  initial?: { body: string; food: number | null; drinks: number | null; night: number | null };
}) {
  const t = useTranslations("review");
  const aspects = reviewAspectsForType(venueType);
  const [food, setFood] = useState(initial?.food ?? 0);
  const [drinks, setDrinks] = useState(initial?.drinks ?? 0);
  const [night, setNight] = useState(initial?.night ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const valueFor = (aspect: ReviewAspect) => (aspect === "FOOD" ? food : aspect === "DRINKS" ? drinks : night);
  const setFor = (aspect: ReviewAspect, value: number) => {
    if (aspect === "FOOD") setFood(value);
    else if (aspect === "DRINKS") setDrinks(value);
    else setNight(value);
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        data.set("venueId", venueId);
        data.set("food", String(food || ""));
        data.set("drinks", String(drinks || ""));
        data.set("night", String(night || ""));
        start(async () => {
          const result = await saveReview(data);
          if (result.error === "auth") setError(t("needLogin"));
          else if (result.error === "own") setError(t("own"));
          else if (result.error === "rate") setError(t("rate"));
          else if (result.error) setError(t("scores"));
          else {
            setError(null);
            setSaved(true);
          }
        });
      }}
    >
      {aspects.map((aspect) => (
        <div key={aspect}>
          <p className="text-sm font-semibold text-paper-text">{t(`aspects.${aspect}`)}</p>
          <div className="mt-2 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setFor(aspect, score)}
                className={cn(
                  "h-10 w-10 rounded-xl border text-sm font-bold",
                  valueFor(aspect) >= score
                    ? "border-paper-text bg-paper-text text-paper"
                    : "border-paper-line bg-white text-paper-muted hover:border-paper-text/50",
                )}
                aria-label={`${score}`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
      ))}
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-paper-text">{t("body")}</span>
        <textarea
          name="body"
          rows={3}
          maxLength={500}
          defaultValue={initial?.body ?? ""}
          placeholder={t("bodyHint")}
          className="w-full rounded-xl border border-paper-line bg-white px-4 py-3 text-sm font-medium text-paper-text outline-none focus:border-paper-text"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved ? <p className="text-sm font-semibold text-paper-text">{t("saved")}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {initial ? t("update") : t("submit")}
      </button>
      <p className="text-xs text-paper-muted">{t("scoresHint")}</p>
    </form>
  );
}

export function RatingBadge({
  overall,
  count,
  label,
  tone = "paper",
}: {
  overall: number | null;
  count: number;
  label: string;
  tone?: "paper" | "cream";
}) {
  if (!overall || count === 0) return null;
  return (
    <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
      <span
        className={
          tone === "cream"
            ? "rounded-md bg-paper px-1.5 py-0.5 text-xs font-bold text-paper-text"
            : "rounded-md bg-paper-text px-1.5 py-0.5 text-xs font-bold text-paper"
        }
      >
        {overall.toFixed(1)}
      </span>
      <span className={tone === "cream" ? "text-cream/70" : "text-paper-muted"}>
        {count} {label}
      </span>
    </p>
  );
}
