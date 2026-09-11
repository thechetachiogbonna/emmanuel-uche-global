import { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);

  if (!session) {
    return Response.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && session.user.role !== "admin") {
    // A logged-in customer wandering into /admin — send them home rather
    // than showing a bare "Unauthorized" page.
    return Response.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
