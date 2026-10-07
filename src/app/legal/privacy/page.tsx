import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
  const t = await getTranslations("legal");
  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-cream">{t("privacyTitle")}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-cream/75">
        <p>{t("privacy1")}</p>
        <p>{t("privacy2")}</p>
        <p>{t("privacy3")}</p>
        <p>{t("privacy4")}</p>
      </div>
    </article>
  );
}
