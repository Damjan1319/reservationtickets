"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HeaderControls } from "@/components/header-controls";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string; kind?: "link" | "ghost" | "primary" };

export function SiteNav({
  links,
  theme,
  logoutLabel,
  logoutAction,
}: {
  links: NavLink[];
  theme: "light" | "dark";
  logoutLabel?: string;
  logoutAction?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const textLinks = links.filter((link) => !link.kind || link.kind === "link");
  const actionLinks = links.filter((link) => link.kind === "ghost" || link.kind === "primary");

  function isActive(href: string) {
    if (href === "/search") return pathname === "/search";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex items-center gap-2">
      <nav className="hidden items-center md:flex">
        <div className="flex items-center gap-5 text-[13.5px] font-medium">
          {textLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition",
                isActive(link.href) ? "text-cream" : "text-cream/60 hover:text-cream",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-5 flex items-center gap-2">
          <HeaderControls theme={theme} />
          {actionLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("btn", link.kind === "primary" ? "btn-primary !px-3.5 !py-2" : "btn-ghost !px-3.5 !py-2")}
            >
              {link.label}
            </Link>
          ))}
          {logoutAction ? (
            <form action={logoutAction}>
              <button type="submit" className="px-1.5 text-[13px] font-semibold text-cream/70 hover:text-cream">
                {logoutLabel}
              </button>
            </form>
          ) : null}
        </div>
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <HeaderControls theme={theme} />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex h-3 w-3.5 flex-col justify-between">
            <span className={`h-px bg-cream transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`h-px bg-cream transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-px bg-cream transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="absolute inset-x-0 top-full bg-surface/95 px-4 py-4 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-2 py-2.5 text-[15px] font-medium",
                  link.kind === "primary"
                    ? "btn btn-primary mt-2 text-center"
                    : isActive(link.href)
                      ? "text-cream"
                      : "text-cream/70 hover:text-cream",
                )}
              >
                {link.label}
              </Link>
            ))}
            {logoutAction ? (
              <form action={logoutAction} className="mt-1">
                <button
                  type="submit"
                  className="w-full rounded-lg px-2 py-2.5 text-left text-[15px] font-medium text-cream/70"
                >
                  {logoutLabel}
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
