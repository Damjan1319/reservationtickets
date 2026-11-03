import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";

export async function Footer() {
  const t = await getTranslations("common");
  const tl = await getTranslations("legal");

  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <Logo className="text-[15px]" />
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-muted">
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
