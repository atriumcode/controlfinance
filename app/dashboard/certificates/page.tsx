import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CertificatesContent } from "@/components/certificates/certificates-content"

export default async function CertificatesPage() {
  const user = await getAuthenticatedUser()
  const supabase = createAdminClient()

  // Get user's company
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  // Get all certificates for the company
  const { data: certificates } = await supabase
    .from("certificates")
    .select(`
      *,
      created_by_profile:profiles!certificates_created_by_fkey(full_name)
    `)
    .eq("company_id", profile.company_id)
    .order("expiration_date", { ascending: true })

  return <CertificatesContent certificates={certificates || []} companyId={profile.company_id} userId={user.id} />
}
