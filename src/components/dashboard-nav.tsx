"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:mt-7 lg:flex-col lg:gap-0.5">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-paper-text text-paper"
                : "text-paper-muted hover:bg-paper-2 hover:text-paper-text",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
