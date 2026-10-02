import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RESERVED_SLUGS, ROOT_HOSTS } from "@/lib/constants";

function tenantSlugFromHost(hostHeader: string) {
  const hostname = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || ROOT_HOSTS.has(hostname)) return null;

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.slice(0, -".localhost".length);
    if (sub && !RESERVED_SLUGS.has(sub)) return sub;
  }

  if (hostname.endsWith(".ulaznice.rs")) {
    const sub = hostname.slice(0, -".ulaznice.rs".length);
    if (sub && !RESERVED_SLUGS.has(sub)) return sub;
  }

  return null;
}

function shouldSkipRewrite(pathname: string) {
  return (
    pathname.startsWith("/v/") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/tickets") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/after-login") ||
    pathname.startsWith("/register-venue")
  );
}

export function proxy(request: NextRequest) {
  const slug = tenantSlugFromHost(request.headers.get("host") ?? "");
  const headers = new Headers(request.headers);

  if (slug) {
    headers.set("x-venue-slug", slug);
    if (!shouldSkipRewrite(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = `/v/${slug}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
      return NextResponse.rewrite(url, { request: { headers } });
    }
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
