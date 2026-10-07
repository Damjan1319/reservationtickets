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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:gap-8 lg:py-10">
      <aside className="w-full shrink-0 rounded-2xl border border-paper-line bg-paper p-5 text-paper-text sm:p-6 lg:w-56">
        <p className="inline-flex rounded-md bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-paper-muted">
          {roleLabel}
        </p>
        <p className="mt-2 text-base font-semibold tracking-tight">{venueName}</p>
        <p className="mt-0.5 text-xs text-paper-muted">{venueSlug}.ulaznice.rs</p>
        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0 flex-1">
        {pendingBanner ? (
          <p className="mb-6 rounded-2xl border border-paper-line bg-paper px-5 py-4 text-sm leading-relaxed text-paper-muted">
            {pendingBanner}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
