import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log("[v0] createClient - SUPABASE_URL:", supabaseUrl)
  console.log("[v0] createClient - SUPABASE_ANON_KEY:", supabaseAnonKey?.substring(0, 20))

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Get auth token from cookies
  const authToken = cookieStore.get("sb-access-token")?.value

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : {},
    },
  })
}

export function createAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log("[v0] createAdminClient - SUPABASE_URL:", supabaseUrl)
  console.log("[v0] createAdminClient - SERVICE_ROLE_KEY:", supabaseServiceRoleKey?.substring(0, 20))

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables for admin client")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export { createClient as createServerClient }
