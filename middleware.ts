import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // const optimisticSession = cookies().get("session");
  const optimisticSession = request.cookies.get("session");
  // mind your own business
  if (optimisticSession && pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.nextUrl));
  }

  // protected route
  if (!optimisticSession && pathname.startsWith("/home")) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"]
};
