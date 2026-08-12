import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* The root layout is the only place `<html lang>` can be set in the App
   Router - nested layouts can't redeclare `<html>`. Routes are duplicated
   folders (`/about` vs `/tr/about`), not a `[lang]` segment, so the layout
   has no param to read the language from. This stamps the language onto a
   request header from the URL, which the layout then reads via headers(). */
export function middleware(request: NextRequest) {
  const isTr = request.nextUrl.pathname === "/tr" || request.nextUrl.pathname.startsWith("/tr/");
  // Forwarded as a REQUEST header (not a response header) - that's the part
  // next/headers' headers() can see when the layout renders.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-lang", isTr ? "tr" : "en");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/|.*\\.[\\w]+$).*)"],
};
