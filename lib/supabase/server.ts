import { cookies } from "next/headers"
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"

function getServerSupabaseClient() {
  const cookieStore = cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
}

/**
 * ✅ Compatibilidade com código antigo
 */
export function createAdminClient() {
  return getServerSupabaseClient()
}

/**
 * ✅ Nome genérico (server)
 */
export function createServerClient() {
  return getServerSupabaseClient()
}
