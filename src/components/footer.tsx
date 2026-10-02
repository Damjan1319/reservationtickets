import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("common");

  return (
    <footer className="mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-cream">Ulaznice</p>
        <p>{t("tagline")}</p>
      </div>
    </footer>
  );
}
