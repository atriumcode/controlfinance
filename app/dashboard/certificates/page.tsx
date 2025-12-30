import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CertificatesContent } from "@/components/certificates/certificates-content"

export default async function CertificatesPage() {
  // Usuário autenticado
  const user = await getAuthenticatedUser()
  const supabase = createAdminClient()

  // Empresa do usuário
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("[PROFILE ERROR]", profileError)
  }

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  // Buscar certidões da empresa
  const { data: certificates, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[CERTIFICATES SELECT ERROR]", error)
  }

  // Renderização (dados crus → Client Component)
  return (
    <CertificatesContent
      certificates={certificates || []}
      companyId={profile.company_id}
      userId={user.id}
    />
  )
}
