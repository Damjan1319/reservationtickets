import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center sm:py-32">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-cream sm:text-3xl">{t("notFoundTitle")}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("notFoundBody")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          {t("notFoundHome")}
        </Link>
        <Link href="/search" className="btn btn-ghost">
          {t("notFoundSearch")}
        </Link>
      </div>
    </div>
  );
}
