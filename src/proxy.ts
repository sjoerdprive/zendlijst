import { NextResponse, type NextRequest } from "next/server";
import { slugFromHost } from "@/entities/organisation";

/*
 * Multi-tenancy: "<slug>.<root domain>/path" is rewritten to "/t/<slug>/path".
 * The tenant itself is re-derived from the Host header in the data access
 * layer, so this is routing only, not authorization.
 */
export function proxy(request: NextRequest) {
  const rootDomain = process.env.APP_ROOT_DOMAIN ?? "localhost:3000";
  const slug = slugFromHost(request.headers.get("host") ?? "", rootDomain);
  const { pathname } = request.nextUrl;

  if (!slug) {
    // Tenant routes are only reachable through a subdomain.
    if (pathname === "/t" || pathname.startsWith("/t/")) {
      return NextResponse.rewrite(new URL("/_tenant-not-found", request.url));
    }
    return NextResponse.next();
  }

  if (slug === "www") {
    const protocol = request.nextUrl.protocol;
    return NextResponse.redirect(new URL(pathname, `${protocol}//${rootDomain}`));
  }

  const url = request.nextUrl.clone();
  url.pathname = `/t/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // API routes (auth, cron, one-click unsubscribe) are host-aware themselves;
  // the PWA files are shared by every host and served from the app root.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
