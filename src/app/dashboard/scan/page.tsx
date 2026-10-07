import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Scanner } from "@/components/scanner";
import { getStaffContext } from "@/lib/staff";

export default async function ScanPage() {
  const t = await getTranslations("scan");
  const locale = await getLocale();
  const context = await getStaffContext();
  if (!context) return null;

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col bg-bg">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="truncate text-sm font-semibold text-cream">{context.venue.name}</p>
        <Link href="/dashboard/reservations" className="shrink-0 text-sm font-medium text-muted hover:text-cream">
          {t("toList")}
        </Link>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-3 pb-4 sm:px-4">
        <Scanner locale={locale} />
      </div>
    </div>
  );
}
