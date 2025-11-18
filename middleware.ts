import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/login", "/auth/register", "/auth/callback"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Get session cookie
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("auth_session")?.value

  // If accessing protected route without session, redirect to login
  if (!isPublicRoute && !sessionToken && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth pages with valid session, redirect to dashboard
  if (isPublicRoute && sessionToken && (pathname === "/auth/login" || pathname === "/auth/register")) {
    const dashboardUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
