import { cookies } from "next/headers"
import { cache } from "react"
import { createServerClient } from "@/lib/supabase/server"

const SESSION_COOKIE_NAME = "auth_session"

export const getAuthenticatedUser = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      expires_at,
      profiles:user_id (
        id,
        email,
        full_name,
        role,
        company_name,
        cnpj,
        company_id,
        is_active
      )
    `)
    .eq("token", sessionToken)
    .single()

  if (error || !data || !data.profiles) {
    return null
  }

  // Check if session is expired
  if (new Date(data.expires_at) < new Date()) {
    return null
  }

  // Return the user profile (profiles is an object, not an array)
  return data.profiles as any
})
