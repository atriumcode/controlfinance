import { createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompanyForm } from "@/components/settings/company-form"

export default async function SettingsPage() {
  const supabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) redirect("/dashboard")

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.company_id)
    .single()

  return <CompanyForm company={company} />
}
