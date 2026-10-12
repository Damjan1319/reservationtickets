import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AddMenuItemForm, CreateMenuForm, DeleteItemButton, MenuActions } from "@/components/menu-forms";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/staff";
import { formatMoney } from "@/lib/utils";

export default async function DashboardMenuPage() {
  const context = await requireStaff();
  if (!context) redirect("/login?callbackUrl=/dashboard/menu");
  const t = await getTranslations("offer");
  const locale = await getLocale();
  const menus = await prisma.menu.findMany({
    where: { venueId: context.venue.id },
    include: { items: { orderBy: [{ section: "asc" }, { createdAt: "asc" }] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader title={t("menusTitle")} description={t("menusHint")} />
      <div className="mt-6">
        <CreateMenuForm />
      </div>
      {menus.length === 0 ? (
        <p className="mt-8 text-cream/70">{t("menusEmpty")}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {menus.map((menu) => (
            <section key={menu.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-bold tracking-tight text-cream">{menu.title}</p>
                  <p className="mt-1 text-sm font-medium text-cream/65">
                    {t(`menuKinds.${menu.kind}`)} · {menu.published ? t("published") : t("hidden")}
                  </p>
                </div>
                <MenuActions menuId={menu.id} published={menu.published} />
              </div>
              {menu.items.length === 0 ? (
                <p className="mt-4 text-sm text-cream/60">{t("itemsEmpty")}</p>
              ) : (
                <ul className="mt-4 divide-y divide-line/70">
                  {menu.items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                      <div>
                        <p className="font-semibold text-cream">
                          {item.name}
                          {item.section ? (
                            <span className="ml-2 text-xs font-medium text-cream/50">{item.section}</span>
                          ) : null}
                        </p>
                        {item.description ? <p className="mt-1 text-sm text-cream/60">{item.description}</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <p className="text-sm font-semibold text-cream">
                          {item.price > 0 ? formatMoney(item.price, locale) : t("priceAsk")}
                        </p>
                        <DeleteItemButton itemId={item.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <AddMenuItemForm menuId={menu.id} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
