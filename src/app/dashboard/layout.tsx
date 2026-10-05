import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DashboardNav } from "@/components/dashboard-nav";
import { getStaffContext } from "@/lib/staff";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
      <aside className="w-full shrink-0 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6 lg:w-56">
        <p className="inline-flex rounded-md bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-paper-muted">
          {owner ? ts("roleOwner") : ts("roleStaff")}
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight">{context.venue.name}</p>
        <p className="mt-0.5 text-xs text-paper-muted">{context.venue.slug}.ulaznice.rs</p>
        <DashboardNav links={links.map((link) => ({ href: link.href, label: t(link.key) }))} />
      </aside>
      <div className="min-w-0 flex-1">
        {context.venue.verificationStatus !== "VERIFIED" ? (
          <p className="mb-6 rounded-2xl border border-paper-line bg-paper px-5 py-4 text-sm leading-relaxed text-paper-muted">
            {t("pendingBanner")}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
