import { NextResponse, type NextRequest } from "next/server";
import { slugFromHost } from "@/entities/organisation";

// Uploaded newsletter files carry their own, stricter sandbox policy
// (see features/read-newsletter/file.ts) and must keep loading remote images.
const NEWSLETTER_FILE_PATH = /^\/newsletters\/[^/]+\/file$/;

/*
 * Strict CSP: scripts only run with this request's nonce (Next.js adds it to
 * its own scripts), so injected markup cannot execute. Styles allow inline
 * attributes, which React and Next.js use and which cannot run code.
 */
const contentSecurityPolicy = (nonce: string): string => {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    // Only over HTTPS: on a plain-HTTP host it would break every asset request.
    ...(process.env.APP_PROTOCOL === "https" ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
};

const withSecurityHeaders = (
  request: NextRequest,
  respond: (init: { request: { headers: Headers } }) => NextResponse,
): NextResponse => {
  if (NEWSLETTER_FILE_PATH.test(request.nextUrl.pathname)) {
    return respond({ request: { headers: new Headers(request.headers) } });
  }
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce);
  // Next.js reads the nonce from the request's CSP header while rendering.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", policy);
  const response = respond({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", policy);
  return response;
};

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
      return withSecurityHeaders(request, (init) =>
        NextResponse.rewrite(new URL("/_tenant-not-found", request.url), init),
      );
    }
    return withSecurityHeaders(request, (init) => NextResponse.next(init));
  }

  if (slug === "www") {
    const protocol = request.nextUrl.protocol;
    return NextResponse.redirect(new URL(pathname, `${protocol}//${rootDomain}`));
  }

  const url = request.nextUrl.clone();
  url.pathname = `/t/${slug}${pathname === "/" ? "" : pathname}`;
  return withSecurityHeaders(request, (init) => NextResponse.rewrite(url, init));
}

export const config = {
  // API routes (auth, cron, one-click unsubscribe) are host-aware themselves;
  // the PWA files are shared by every host and served from the app root.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
