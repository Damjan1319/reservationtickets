import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("common");
  const tl = await getTranslations("legal");

  return (
    <footer className="mt-auto border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-cream">Ulaznice</p>
        <div className="flex flex-wrap gap-4 text-cream/60">
          <p>{t("tagline")}</p>
          <Link href="/legal/terms" className="hover:text-cream">
            {tl("termsLink")}
          </Link>
          <Link href="/legal/privacy" className="hover:text-cream">
            {tl("privacyLink")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
