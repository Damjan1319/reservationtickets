"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";

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
  links: { href: string; label: string }[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === "/dashboard/scan") {
    return <div className="min-h-[calc(100dvh-4.5rem)]">{children}</div>;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 lg:flex-row lg:py-8">
      <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-52">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-cream/50">{roleLabel}</p>
        <p className="mt-1 text-base font-bold tracking-tight text-cream">{venueName}</p>
        <p className="mt-0.5 text-xs text-cream/50">{venueSlug}.ulaznice.rs</p>
        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0 flex-1">
        {pendingBanner ? (
          <p className="mb-6 rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-cream/80">
            {pendingBanner}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
