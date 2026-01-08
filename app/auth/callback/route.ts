export const dynamic = "force-dynamic"
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
          },
        },
      },
    )

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        console.log("[v0] Email confirmation successful for user:", data.user.id)

        // Check if profile exists, if not wait a bit for trigger to create it
        let attempts = 0
        const maxAttempts = 5
        let profile = null

        while (!profile && attempts < maxAttempts) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, role, full_name, company_id")
            .eq("id", data.user.id)
            .single()

          if (profileData && !profileError) {
            profile = profileData
            break
          }

          attempts++
          console.log(`[v0] Profile check attempt ${attempts} for confirmed user:`, { profileData, profileError })

          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }

        if (profile) {
          console.log("[v0] Profile found for confirmed user, redirecting to dashboard")
          return NextResponse.redirect(`${origin}${next}`)
        } else {
          console.log("[v0] Profile not found for confirmed user, redirecting to login with error")
          return NextResponse.redirect(`${origin}/auth/login?error=profile_not_found`)
        }
      } else {
        console.log("[v0] Email confirmation failed:", error)
        return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
      }
    } catch (error) {
      console.log("[v0] Auth callback error:", error)
      return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
}
