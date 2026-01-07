// lib/auth/require-company.ts
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function requireCompany() {
  const { user } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  return profile
}
