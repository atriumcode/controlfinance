import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
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
 * ✅ Compatibilidade com código existente
 */
export function createAdminClient() {
  return createSupabaseServerClient()
}

/**
 * ✅ Nome genérico para novos usos
 */
export function createServerClient() {
  return createSupabaseServerClient()
}
