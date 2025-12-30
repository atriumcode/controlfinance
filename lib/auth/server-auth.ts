import { cookies } from "next/headers"
import { cache } from "react"
import { createAdminClient } from "@/lib/supabase/server"

const SESSION_COOKIE_NAME = "auth_session"

export const getAuthenticatedUser = cache(async () => {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("sessions")
    .select(`
      expires_at,
      profiles:user_id (
        id,
        email,
        full_name,
        role,
        company_id,
        is_active,
        companies:company_id (
          id,
          name,
          cnpj
        )
      )
    `)
    .eq("token", sessionToken)
    .single()

  if (error || !data?.profiles) {
    return null
  }

  // Sessão expirada
  if (new Date(data.expires_at) < new Date()) {
    return null
  }

  const profile = data.profiles

  return {
    id: profile.id,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    isActive: profile.is_active,
    company: profile.companies
      ? {
          id: profile.companies.id,
          name: profile.companies.name,
          cnpj: profile.companies.cnpj,
        }
      : null,
  }
})
