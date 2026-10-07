import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";
import { SiteNav } from "@/components/site-nav";
import { getTheme } from "@/lib/theme";

export async function Header() {
  const t = await getTranslations("nav");
  const theme = await getTheme();
  const session = await auth();
  const staff = session ? await getStaffContext() : null;
  const admin = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
    : null;

  const links = session
    ? [
        { href: "/#venues", label: t("venues") },
        { href: "/tickets", label: t("tickets") },
        ...(staff
          ? [
              {
                href: staff.role === "STAFF" ? "/dashboard/scan" : "/dashboard",
                label: staff.role === "STAFF" ? t("scan") : t("dashboard"),
              },
            ]
          : []),
        ...(admin?.isAdmin ? [{ href: "/admin", label: t("admin") }] : []),
      ]
    : [
        { href: "/#venues", label: t("venues") },
        { href: "/register-venue", label: t("registerVenue") },
        { href: "/login", label: t("login") },
      ];

  return (
    <header className="site-header sticky top-0 z-40 bg-bg/80 backdrop-blur-md">
      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 items-center">
          <Link href="/" className="text-[1.15rem] font-semibold tracking-tight text-cream">
            Ulaznice
          </Link>
        </div>
        <SiteNav
          links={links}
          theme={theme}
          logoutLabel={session ? t("logout") : undefined}
          logoutAction={
            session
              ? async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }
              : undefined
          }
        />
      </div>
    </header>
  );
}
