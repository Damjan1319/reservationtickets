"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardNav, type DashboardLink } from "@/components/dashboard-nav";
import { APP_DOMAIN } from "@/lib/constants";

export function DashboardChrome({
  roleLabel,
  venueName,
  venueSlug,
  pendingBanner,
  links,
  children,
}: {
  roleLabel: string;
  venueName: string;
  venueSlug: string;
  pendingBanner?: string;
  links: DashboardLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/dashboard/scan") {
    return <div className="min-h-[calc(100dvh-4.5rem)]">{children}</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:gap-10 lg:py-8">
      <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:h-fit lg:w-56">
        <div className="rounded-xl border border-line px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-cream">{venueName}</p>
          <p className="mt-0.5 truncate text-xs text-muted">
            {roleLabel} · {APP_DOMAIN}/v/{venueSlug}
          </p>
        </div>
        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0 flex-1">
        {pendingBanner ? (
          <p className="mb-6 rounded-xl border border-line px-4 py-3 text-sm leading-relaxed text-muted">
            {pendingBanner}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
