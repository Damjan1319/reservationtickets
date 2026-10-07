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
    <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:mt-6 lg:flex-col lg:gap-0.5">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition",
              active ? "bg-paper text-paper-text" : "text-cream/85 hover:bg-surface hover:text-cream",
            )}
          >
            <span>{link.label}</span>
            {link.badge ? (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
                  active ? "bg-paper-text text-paper" : "bg-paper text-paper-text",
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
