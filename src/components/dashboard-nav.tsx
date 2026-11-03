"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type DashboardLink = {
  href: string;
  label: string;
  badge?: number;
};

export function DashboardNav({ links }: { links: DashboardLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-5 lg:flex-col lg:gap-0.5">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition",
              active ? "bg-surface-2 text-cream" : "text-muted hover:bg-surface hover:text-cream",
            )}
          >
            <span>{link.label}</span>
            {link.badge ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full bg-cream px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-bg",
                )}
              >
                {link.badge > 99 ? "99+" : link.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
