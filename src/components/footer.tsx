import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("common");

  return (
    <footer className="mt-auto border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-cream">Ulaznice</p>
        <p className="text-cream/60">{t("tagline")}</p>
      </div>
    </footer>
  );
}
