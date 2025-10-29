import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const supabase = await createServerClient()

  // Validate session
  const { data: session } = await supabase.from("sessions").select("*").eq("token", sessionToken).single()

  if (!session) {
    return null
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    return null
  }

  // Get user profile
  const { data: user } = await supabase.from("profiles").select("*").eq("id", session.user_id).single()

  return user
}
