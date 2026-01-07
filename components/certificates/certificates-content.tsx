"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText } from "lucide-react"
import { CertificatesTable } from "./certificates-table"
import { UploadCertificateDialog } from "./upload-certificate-dialog"
import Link from "next/link"

interface Certificate {
  id: string
  name: string
  description: string | null
  file_url: string
  file_size: number | null
  expiration_date: string | null
  created_at?: string
}

interface CertificatesContentProps {
  certificates: Certificate[]
  companyId: string
  userId: string
}

export function CertificatesContent({
  certificates,
  companyId,
  userId,
}: CertificatesContentProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  // Data base (hoje)
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // Certidões vigentes
  const validCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      if (!cert.expiration_date) return true

      const expirationDate = new Date(cert.expiration_date)
      expirationDate.setHours(0, 0, 0, 0)

      return expirationDate >= today
    })
  }, [certificates, today])

  // Certidões vencidas
  const expiredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      if (!cert.expiration_date) return false

      const expirationDate = new Date(cert.expiration_date)
      expirationDate.setHours(0, 0, 0, 0)

      return expirationDate < today
    })
  }, [certificates, today])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Certidões</h1>
        </nav>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Nova Certidão
        </Button>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Certidões</h2>
            <p className="text-muted-foreground">
              Gerencie suas certidões negativas e documentos
            </p>
          </div>
        </div>

        <Tabs defaultValue="valid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="valid" className="gap-2">
              <FileText className="h-4 w-4" />
              Certidões Vigentes
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                {validCertificates.length}
              </span>
            </TabsTrigger>

            <TabsTrigger value="expired" className="gap-2">
              <FileText className="h-4 w-4" />
              Certidões Vencidas
              <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {expiredCertificates.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valid" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certidões Vigentes</CardTitle>
                <CardDescription>
                  {validCertificates.length} certidão
                  {validCertificates.length !== 1 ? "ões" : ""} válida
                  {validCertificates.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificatesTable certificates={validCertificates} type="valid" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certidões Vencidas</CardTitle>
                <CardDescription>
                  {expiredCertificates.length} certidão
                  {expiredCertificates.length !== 1 ? "ões" : ""} vencida
                  {expiredCertificates.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificatesTable certificates={expiredCertificates} type="expired" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <UploadCertificateDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        companyId={companyId}
        userId={userId}
      />
    </div>
  )
}
