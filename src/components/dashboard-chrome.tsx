"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardNav, type DashboardLink } from "@/components/dashboard-nav";

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
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:py-8">
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-56">
        <p className="text-xs font-medium text-cream/55">{roleLabel}</p>
        <p className="mt-1 text-lg font-bold tracking-tight text-cream">{venueName}</p>
        <p className="mt-0.5 text-xs text-cream/45">{venueSlug}.ulaznice.rs</p>
        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0 flex-1">
        {pendingBanner ? (
          <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-cream/70">
            {pendingBanner}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
