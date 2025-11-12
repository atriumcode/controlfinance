import { cookies } from "next/headers"
import { cache } from "react"
import { query } from "@/lib/db/postgres"

const SESSION_COOKIE_NAME = "auth_session"

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const sql = `
    SELECT 
      s.expires_at,
      p.id,
      p.email,
      p.full_name,
      p.role,
      p.cnpj,
      p.company_id,
      p.is_active
    FROM sessions s
    INNER JOIN profiles p ON s.user_id = p.id
    WHERE s.token = $1
    LIMIT 1
  `

  const rows = await query(sql, [sessionToken])

  if (!rows || rows.length === 0) {
    return null
  }

  const data = rows[0]

  // Check if session is expired
  if (new Date(data.expires_at) < new Date()) {
    return null
  }

  // Return the user profile
  return {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    cnpj: data.cnpj,
    company_id: data.company_id,
    is_active: data.is_active,
  }
})

export const getAuthenticatedUser = getCurrentUser
