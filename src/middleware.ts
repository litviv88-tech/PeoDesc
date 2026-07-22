import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Лёгкая защита маршрутов на Edge без Prisma/Auth.js (лимит Vercel Hobby: 1 MB).
 * Наличие cookie сессии — быстрый фильтр; точная проверка — в requireUser() на сервере.
 */
export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  if (!isProtected) {
    return NextResponse.next();
  }

  // Auth.js v5: имя cookie зависит от HTTPS (__Secure-…)
  const hasSession =
    Boolean(req.cookies.get("authjs.session-token")?.value) ||
    Boolean(req.cookies.get("__Secure-authjs.session-token")?.value);

  if (!hasSession) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/my-prompts/:path*"],
};
