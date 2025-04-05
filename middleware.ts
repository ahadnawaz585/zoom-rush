// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = request.cookies.get("session");
  const adminSession = request.cookies.get("adminSession");

  // Redirect logged-in users from root to home
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.nextUrl));
  }

  // Protect /home route - requires session
  if (!session && pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (pathname.startsWith("/users")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.nextUrl));
    }
    if (!adminSession) {
      return NextResponse.redirect(new URL("/home", request.nextUrl));
    }
  }

  // Allow request to proceed if no conditions are met
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"]
};




