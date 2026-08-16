import { NextRequest } from "next/server";
import { getSessionSubjectTypeAndId } from "./lib/session";

export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const sessionToken = sessionCookie?.value;

  const redirectUrl = new URL("/login", request.url);

  if (!sessionToken) {
    return Response.redirect(redirectUrl);
  }

  const sessionSubjectTypeAndId = await getSessionSubjectTypeAndId();

  if (!sessionSubjectTypeAndId) {
    return Response.redirect(redirectUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && sessionSubjectTypeAndId.type !== "admin") {
    return new Response("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};