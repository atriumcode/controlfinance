import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"

const SESSION_COOKIE_NAME = "auth_session"

export async function getAuthenticatedUser() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) return null

  const supabase = createAdminClient()

  const { data } = await supabase
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

  if (!data?.profiles) return null
  if (new Date(data.expires_at) < new Date()) return null
  if (!data.profiles.is_active) return null

  return {
    id: data.profiles.id,
    name: data.profiles.full_name,
    email: data.profiles.email,
    role: data.profiles.role,
    company_id: data.profiles.company_id,
    company: data.profiles.companies
      ? {
          id: data.profiles.companies.id,
          name: data.profiles.companies.name,
          cnpj: data.profiles.companies.cnpj,
        }
      : null,
  }
}
