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
  const { data: certificates, error: certificatesError } = await supabase
    .from("certificates")
    .select("*") // ❗ JOIN removido para evitar erro silencioso
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  if (certificatesError) {
    console.error("[CERTIFICATES SELECT ERROR]", certificatesError)
  }

  // Data base (hoje)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Certidões vigentes
  const validCertificates = (certificates || []).filter((cert) => {
    // Sem data de expiração = vigente
    if (!cert.expiration_date) return true

    const expirationDate = new Date(cert.expiration_date)
    expirationDate.setHours(0, 0, 0, 0)

    return expirationDate >= today
  })

  // Certidões vencidas
  const expiredCertificates = (certificates || []).filter((cert) => {
    if (!cert.expiration_date) return false

    const expirationDate = new Date(cert.expiration_date)
    expirationDate.setHours(0, 0, 0, 0)

    return expirationDate < today
  })

  // Renderização
  return (
    <CertificatesContent
      validCertificates={validCertificates}
      expiredCertificates={expiredCertificates}
      companyId={profile.company_id}
      userId={user.id}
    />
  )
}
