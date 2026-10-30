import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getRobotsHeader } from "@lib/utils/robots";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Explicitly allow indexing on the production hosts only (this also overrides
  // a noindex that Next.js may set there). Every other host serving
  // the site (trial domains, workers.dev, previews) is noindex, and so is the
  // private /admin area on every host.
  response.headers.set(
    "x-robots-tag",
    getRobotsHeader(request.headers.get("host"), request.nextUrl.pathname),
  );

  return response;
}

// Run middleware on all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)",
  ],
};
