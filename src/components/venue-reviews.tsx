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
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{t("title")}</h2>
        <RatingBadge overall={summary.overall} count={summary.count} label={t("countLabel")} tone="cream" />
      </div>
      {summary.count > 0 ? (
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-cream/75">
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
        <p className="mt-4 text-cream/70">{t("empty")}</p>
      )}

      <div className="mt-6 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
        {canReview ? (
          <>
            <p className="mb-4 text-sm font-semibold">{mine ? t("yours") : t("write")}</p>
            <ReviewForm
              venueId={venueId}
              venueType={venueType}
              initial={mine ? { body: mine.body, food: mine.food, drinks: mine.drinks, night: mine.night } : undefined}
            />
          </>
        ) : loggedIn ? (
          <p className="text-sm font-medium text-paper-muted">{t("own")}</p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-paper-muted">{t("needLogin")}</p>
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/v/${slug}`)}`} className="btn btn-primary">
              {tn("login")}
            </Link>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-line bg-surface p-4">
              <p className="font-semibold text-cream">{item.name}</p>
              <p className="mt-1 text-sm font-medium text-cream/70">
                {aspects
                  .map((aspect) => {
                    const value = aspect === "FOOD" ? item.food : aspect === "DRINKS" ? item.drinks : item.night;
                    return value != null ? `${t(`aspects.${aspect}`)} ${value}` : null;
                  })
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {item.body ? <p className="mt-3 text-sm leading-relaxed text-cream/80">{item.body}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
