import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CertificatesContent } from "@/components/certificates/certificates-content"

interface EnrichedCertificate {
  id: string
  name: string
  description: string | null
  file_url: string
  file_size: number
  uploaded_at: string
  expiration_date: string
  created_by_profile: { full_name: string } | null
  daysUntilExpiration: number
  isExpiringSoon: boolean
}

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

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const enrichedCertificates: EnrichedCertificate[] = (certificates || []).map((cert) => {
    const expirationDate = new Date(cert.expiration_date)
    expirationDate.setHours(0, 0, 0, 0)

    const diffTime = expirationDate.getTime() - today.getTime()
    const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const isExpiringSoon = daysUntilExpiration <= 5 && daysUntilExpiration >= 0

    return {
      ...cert,
      daysUntilExpiration,
      isExpiringSoon,
    }
  })

  const validCertificates = enrichedCertificates.filter((cert) => cert.daysUntilExpiration >= 0)
  const expiredCertificates = enrichedCertificates.filter((cert) => cert.daysUntilExpiration < 0)

  return (
    <CertificatesContent
      validCertificates={validCertificates}
      expiredCertificates={expiredCertificates}
      companyId={profile.company_id}
      userId={user.id}
    />
  )
}
