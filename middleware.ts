import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // Check for session token in cookies
  const sessionToken = request.cookies.get("session_token")?.value

  // If no session token, redirect to login for protected routes
  if (!sessionToken && request.nextUrl.pathname !== "/" && !request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If we have a session token, verify it's valid
  if (sessionToken) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            },
          },
        },
      )

      // Check if session is valid and not expired
      const { data: session } = await supabase
        .from("user_sessions")
        .select("expires_at, user_id")
        .eq("session_token", sessionToken)
        .single()

      if (!session || new Date(session.expires_at) < new Date()) {
        // Session expired or invalid, clear cookie and redirect to login
        response.cookies.delete("session_token")

        if (request.nextUrl.pathname !== "/" && !request.nextUrl.pathname.startsWith("/auth")) {
          const url = request.nextUrl.clone()
          url.pathname = "/auth/login"
          return NextResponse.redirect(url)
        }
      }
    } catch (error) {
      console.error("Middleware session check error:", error)
      // On error, clear session and redirect if on protected route
      response.cookies.delete("session_token")

      if (request.nextUrl.pathname !== "/" && !request.nextUrl.pathname.startsWith("/auth")) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
