"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CertificatesContent } from "@/components/certificates/certificates-content"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Certificate {
  id: string
  name: string
  description: string | null
  file_url: string
  file_size: number
  uploaded_at: string
  expiration_date: string
  created_by_profile: { full_name: string } | null
}

interface EnrichedCertificate extends Certificate {
  daysUntilExpiration: number
  isExpiringSoon: boolean
}

export default function CertificatesPage() {
  const [loading, setLoading] = useState(true)
  const [validCertificates, setValidCertificates] = useState<EnrichedCertificate[]>([])
  const [expiredCertificates, setExpiredCertificates] = useState<EnrichedCertificate[]>([])
  const [companyId, setCompanyId] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [missingCompany, setMissingCompany] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadCertificates() {
      const supabase = createBrowserClient()

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setTimeout(loadCertificates, 100)
        return
      }

      setUserId(user.id)

      // Get user's company
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

      if (!profile?.company_id) {
        setMissingCompany(true)
        setLoading(false)
        return
      }

      setCompanyId(profile.company_id)

      // Get all certificates for the company
      const { data: certificates } = await supabase
        .from("certificates")
        .select(
          `
          *,
          created_by_profile:profiles!certificates_created_by_fkey(full_name)
        `,
        )
        .eq("company_id", profile.company_id)
        .order("expiration_date", { ascending: true })

      if (certificates) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const enriched: EnrichedCertificate[] = certificates.map((cert) => {
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

        setValidCertificates(enriched.filter((cert) => cert.daysUntilExpiration >= 0))
        setExpiredCertificates(enriched.filter((cert) => cert.daysUntilExpiration < 0))
      }

      setLoading(false)
    }

    loadCertificates()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando certidões...</p>
        </div>
      </div>
    )
  }

  if (missingCompany) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração Necessária</CardTitle>
            <CardDescription>Você precisa configurar sua empresa antes de acessar as certidões.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/settings">Configurar Empresa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <CertificatesContent
      validCertificates={validCertificates}
      expiredCertificates={expiredCertificates}
      companyId={companyId}
      userId={userId}
    />
  )
}
