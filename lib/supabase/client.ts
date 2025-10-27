import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl =
    typeof window !== "undefined"
      ? (window as any).ENV?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey =
    typeof window !== "undefined"
      ? (window as any).ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables. Please check your environment configuration.")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export { createClient as createBrowserClient }
