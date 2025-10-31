import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();

  // Override x-robots-tag header to allow indexing
  // This ensures that even if Next.js or Vercel sets noindex,
  // we explicitly allow indexing
  response.headers.set("x-robots-tag", "index, follow");

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

