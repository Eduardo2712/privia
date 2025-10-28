import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const currentUser = request.cookies.get("privia-token")?.value;

    if (currentUser && publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/inbox", request.url));
    }

    if (!currentUser && !publicRoutes.includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

export const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/"];
