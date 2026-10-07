import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardChrome } from "@/components/dashboard-chrome";
import { getStaffContext } from "@/lib/staff";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await getStaffContext();
  if (!context) redirect("/login?callbackUrl=/after-login");
  const t = await getTranslations("dashboard");
  const ts = await getTranslations("staff");
  const owner = context.role === "OWNER";

  const links = [
    ...(owner ? [{ href: "/dashboard", key: "overview" }] : []),
    { href: "/dashboard/scan", key: "scan" },
    { href: "/dashboard/create", key: "newBooking" },
    ...(owner ? [{ href: "/dashboard/events", key: "parties" }] : []),
    { href: "/dashboard/tickets", key: "tickets" },
    { href: "/dashboard/reservations", key: "tables" },
    ...(owner ? [{ href: "/dashboard/staff", key: "staff" }, { href: "/dashboard/settings", key: "settings" }] : []),
  ];

  return (
    <DashboardChrome
      roleLabel={owner ? ts("roleOwner") : ts("roleStaff")}
      venueName={context.venue.name}
      venueSlug={context.venue.slug}
      pendingBanner={context.venue.verificationStatus !== "VERIFIED" ? t("pendingBanner") : undefined}
      links={links.map((link) => ({ href: link.href, label: t(link.key) }))}
    >
      {children}
    </DashboardChrome>
  );
}
