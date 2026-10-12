import { getTranslations } from "next-intl/server";

type Promo = {
  id: string;
  title: string;
  body: string;
  kind: string;
};

export async function VenueOffers({ promos }: { promos: Promo[] }) {
  const t = await getTranslations("offer");
  if (promos.length === 0) return null;

  return (
    <div className="mb-6 grid gap-2">
      {promos.map((promo) => (
        <article
          key={promo.id}
          className="rounded-xl border border-paper-line bg-paper px-4 py-3 text-paper-text"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-paper-muted">
            {t(`promoKinds.${promo.kind}`)}
          </p>
          <p className="mt-0.5 font-semibold">{promo.title}</p>
          {promo.body ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-paper-muted">{promo.body}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
