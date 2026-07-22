import { auth } from "@/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/my-prompts");

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/my-prompts/:path*"],
};
