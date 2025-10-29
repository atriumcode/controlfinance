import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

const SESSION_COOKIE_NAME = "auth_session"

export async function getAuthenticatedUser() {
  console.log("[v0] getAuthenticatedUser - checking authentication")

  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  console.log("[v0] getAuthenticatedUser - session token found:", !!sessionToken)

  if (!sessionToken) {
    console.log("[v0] getAuthenticatedUser - no session token")
    return null
  }

  const supabase = await createServerClient()

  // Validate session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("token", sessionToken)
    .single()

  console.log("[v0] getAuthenticatedUser - session found:", !!session, "error:", sessionError?.message)

  if (!session || sessionError) {
    console.log("[v0] getAuthenticatedUser - invalid session")
    return null
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    console.log("[v0] getAuthenticatedUser - session expired")
    return null
  }

  // Get user profile
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user_id)
    .single()

  console.log("[v0] getAuthenticatedUser - user found:", !!user, "error:", userError?.message)

  if (!user || userError) {
    console.log("[v0] getAuthenticatedUser - user not found")
    return null
  }

  console.log("[v0] getAuthenticatedUser - authentication successful for user:", user.email)
  return user
}
