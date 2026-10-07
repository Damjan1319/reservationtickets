import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardChrome } from "@/components/dashboard-chrome";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await getStaffContext();
  if (!context) redirect("/login?callbackUrl=/after-login");
  const t = await getTranslations("dashboard");
  const ts = await getTranslations("staff");
  const owner = context.role === "OWNER";
  const pendingWhere = { venueId: context.venue.id, status: "PENDING" as const };
  const [pendingTables, pendingTickets] = await Promise.all([
    prisma.reservation.count({ where: { ...pendingWhere, kind: "TABLE" } }),
    prisma.reservation.count({ where: { ...pendingWhere, kind: "EVENT" } }),
  ]);

  const links = [
    ...(owner ? [{ href: "/dashboard", key: "overview" as const }] : []),
    { href: "/dashboard/scan", key: "scan" as const },
    { href: "/dashboard/create", key: "newBooking" as const },
    ...(owner ? [{ href: "/dashboard/events", key: "parties" as const }] : []),
    { href: "/dashboard/tickets", key: "tickets" as const, badge: pendingTickets },
    { href: "/dashboard/reservations", key: "tables" as const, badge: pendingTables },
    ...(owner
      ? [
          { href: "/dashboard/staff", key: "staff" as const },
          { href: "/dashboard/settings", key: "settings" as const },
        ]
      : []),
  ];

  return (
    <DashboardChrome
      roleLabel={owner ? ts("roleOwner") : ts("roleStaff")}
      venueName={context.venue.name}
      venueSlug={context.venue.slug}
      pendingBanner={context.venue.verificationStatus !== "VERIFIED" ? t("pendingBanner") : undefined}
      links={links.map((link) => ({
        href: link.href,
        label: t(link.key),
        badge: "badge" in link ? link.badge : undefined,
      }))}
    >
      {children}
    </DashboardChrome>
  );
}
