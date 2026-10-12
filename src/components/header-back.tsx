"use client";

import { usePathname, useRouter } from "next/navigation";

function fallback(pathname: string) {
  if (pathname.startsWith("/v/")) return "/search";
  if (pathname === "/search") return "/";
  if (pathname.startsWith("/tickets/")) return "/tickets";
  if (pathname.startsWith("/dashboard/")) return "/dashboard";
  if (pathname.startsWith("/admin")) return "/";
  return "/";
}

export function HeaderBack({ label }: { label: string }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/") return null;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        try {
          const from = document.referrer ? new URL(document.referrer) : null;
          if (from && from.origin === window.location.origin) {
            router.back();
            return;
          }
        } catch {
          /* stay on fallback */
        }
        router.push(fallback(pathname));
      }}
      className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-cream/80 transition hover:bg-surface hover:text-cream"
    >
      <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden className="shrink-0">
        <path
          d="M8 2 2 8l6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
