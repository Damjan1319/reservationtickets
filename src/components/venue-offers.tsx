import { getLocale, getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/utils";

type Menu = {
  id: string;
  title: string;
  kind: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    section: string;
  }>;
};

type Promo = {
  id: string;
  title: string;
  body: string;
  kind: string;
};

export async function VenueOffers({ menus, promos }: { menus: Menu[]; promos: Promo[] }) {
  const t = await getTranslations("offer");
  const locale = await getLocale();
  if (menus.length === 0 && promos.length === 0) return null;

  return (
    <div className="space-y-10">
      {promos.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{t("promosPublic")}</h2>
          <div className="mt-5 grid gap-3">
            {promos.map((promo) => (
              <article key={promo.id} className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
                <p className="text-xs font-semibold uppercase tracking-wide text-paper-muted">
                  {t(`promoKinds.${promo.kind}`)}
                </p>
                <h3 className="mt-1 text-lg font-bold">{promo.title}</h3>
                {promo.body ? <p className="mt-2 text-sm leading-relaxed text-paper-muted">{promo.body}</p> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {menus.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-cream sm:text-3xl">{t("menusPublic")}</h2>
          <div className="mt-5 space-y-4">
            {menus.map((menu) => (
              <article key={menu.id} className="rounded-2xl border border-paper-line bg-paper p-5 text-paper-text">
                <p className="text-xs font-semibold text-paper-muted">{t(`menuKinds.${menu.kind}`)}</p>
                <h3 className="mt-1 text-xl font-bold">{menu.title}</h3>
                <ul className="mt-4 divide-y divide-paper-line">
                  {menu.items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                      <div>
                        <p className="font-semibold">
                          {item.name}
                          {item.section ? (
                            <span className="ml-2 text-xs font-medium text-paper-muted">{item.section}</span>
                          ) : null}
                        </p>
                        {item.description ? (
                          <p className="mt-1 text-sm text-paper-muted">{item.description}</p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {item.price > 0 ? formatMoney(item.price, locale) : t("priceAsk")}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
