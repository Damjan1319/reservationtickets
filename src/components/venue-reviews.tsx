import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RatingBadge, ReviewForm } from "@/components/review-form";
import { reviewAspectsForType } from "@/lib/constants";
import { type ReviewSummary } from "@/lib/reviews";

type Item = {
  id: string;
  name: string;
  body: string;
  food: number | null;
  drinks: number | null;
  night: number | null;
};

export async function VenueReviews({
  venueId,
  venueType,
  slug,
  summary,
  items,
  mine,
  canReview,
  loggedIn,
}: {
  venueId: string;
  venueType: string;
  slug: string;
  summary: ReviewSummary;
  items: Item[];
  mine: Item | null;
  canReview: boolean;
  loggedIn: boolean;
}) {
  const t = await getTranslations("review");
  const tn = await getTranslations("nav");
  const aspects = reviewAspectsForType(venueType);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        {summary.count > 0 ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-cream/75">
            <RatingBadge overall={summary.overall} count={summary.count} label={t("countLabel")} tone="cream" />
            {aspects.map((aspect) => {
              const value = aspect === "FOOD" ? summary.food : aspect === "DRINKS" ? summary.drinks : summary.night;
              if (value == null) return null;
              return (
                <p key={aspect}>
                  {t(`aspects.${aspect}`)} {value.toFixed(1)}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-cream/70">{t("empty")}</p>
        )}
      </div>

      {canReview ? (
        <div className="mt-6 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
          <p className="mb-4 text-sm font-semibold">{mine ? t("yours") : t("write")}</p>
          <ReviewForm
            venueId={venueId}
            venueType={venueType}
            initial={mine ? { body: mine.body, food: mine.food, drinks: mine.drinks, night: mine.night } : undefined}
          />
        </div>
      ) : loggedIn ? (
        <p className="mt-4 text-sm font-medium text-cream/55">{t("own")}</p>
      ) : (
        <p className="mt-4 text-sm font-medium text-cream/70">
          {t("needLogin")}{" "}
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/v/${slug}`)}`} className="font-semibold text-cream underline">
            {tn("login")}
          </Link>
        </p>
      )}

      {items.length > 0 ? (
        <ul className="mt-6 divide-y divide-line/80 border-t border-line/80">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-cream">{item.name}</p>
                <p className="text-sm font-medium text-cream/60">
                  {aspects
                    .map((aspect) => {
                      const value = aspect === "FOOD" ? item.food : aspect === "DRINKS" ? item.drinks : item.night;
                      return value != null ? `${t(`aspects.${aspect}`)} ${value}` : null;
                    })
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {item.body ? <p className="mt-2 text-sm leading-relaxed text-cream/75">{item.body}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
