import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStaffContext } from "@/lib/staff";
import { HeaderBack } from "@/components/header-back";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { getTheme } from "@/lib/theme";

export async function Header() {
  const t = await getTranslations("nav");
  const tc = await getTranslations("common");
  const theme = await getTheme();
  const session = await auth();
  const staff = session ? await getStaffContext() : null;
  const admin = session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { isAdmin: true } })
    : null;

  const links = session
    ? [
        { href: "/", label: t("home") },
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
        { href: "/", label: t("home") },
        { href: "/register-venue", label: t("registerVenue") },
        { href: "/login", label: t("login"), kind: "primary" as const },
      ];

  return (
    <header className="site-header sticky top-0 z-40 bg-bg/90 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-1">
          <HeaderBack label={tc("back")} />
          <Link href="/" aria-label={tc("appName")}>
            <Logo />
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
