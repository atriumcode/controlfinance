import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CertificatesContent } from "@/components/certificates/certificates-content"

export default async function CertificatesPage() {
  const user = await getAuthenticatedUser()

  if (!user?.company?.id) {
    redirect("/dashboard/settings")
  }

  const companyId = user.company.id
  const supabase = createAdminClient()

  const { data: certificates, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[CERTIFICATES SELECT ERROR]", error)
  }

  return (
    <CertificatesContent
      certificates={certificates || []}
      companyId={companyId}
      userId={user.id}
    />
  )
}
