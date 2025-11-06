"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, FileText, Trash2, Calendar, User, HardDrive } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SendEmailDialog } from "./send-email-dialog"

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

interface CertificatesTableProps {
  certificates: Certificate[]
  type: "valid" | "expired"
}

export function CertificatesTable({ certificates, type }: CertificatesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [certificateToDelete, setCertificateToDelete] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedIds.length === certificates.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(certificates.map((cert) => cert.id))
    }
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiration = new Date(expirationDate)
    expiration.setHours(0, 0, 0, 0)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const handleDownload = async (certificate: Certificate) => {
    try {
      const response = await fetch(certificate.file_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = certificate.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Download iniciado")
    } catch (error) {
      toast.error("Erro ao baixar arquivo")
    }
  }

  const handleBulkDownload = async () => {
    const selectedCertificates = certificates.filter((cert) => selectedIds.includes(cert.id))
    for (const cert of selectedCertificates) {
      await handleDownload(cert)
      // Pequeno delay entre downloads
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  const handleDelete = async () => {
    if (!certificateToDelete) return

    try {
      const response = await fetch(`/api/certificates/${certificateToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error()

      toast.success("Certidão excluída com sucesso")
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao excluir certidão")
    } finally {
      setDeleteDialogOpen(false)
      setCertificateToDelete(null)
    }
  }

  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma certidão encontrada</h3>
        <p className="text-sm text-muted-foreground">
          {type === "valid" ? "Não há certidões vigentes no momento." : "Não há certidões vencidas."}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedIds.length} selecionada(s)</span>
            <Button size="sm" variant="outline" onClick={handleBulkDownload}>
              <Download className="mr-2 h-4 w-4" />
              Baixar Selecionadas
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEmailDialogOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar por Email
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectedIds.length === certificates.length} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Adicionado por</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => {
                const daysUntilExpiration = getDaysUntilExpiration(certificate.expiration_date)
                const isExpiringSoon = daysUntilExpiration <= 30 && daysUntilExpiration > 0

                return (
                  <TableRow key={certificate.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(certificate.id)}
                        onCheckedChange={() => toggleSelection(certificate.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {certificate.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{certificate.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(certificate.expiration_date).toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {type === "valid" ? (
                        <Badge variant={isExpiringSoon ? "destructive" : "default"}>
                          {daysUntilExpiration === 0
                            ? "Vence hoje"
                            : daysUntilExpiration === 1
                              ? "1 dia restante"
                              : `${daysUntilExpiration} dias restantes`}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive">
                          Vencida há {Math.abs(daysUntilExpiration)} dia{Math.abs(daysUntilExpiration) !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HardDrive className="h-4 w-4" />
                        {formatFileSize(certificate.file_size)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {certificate.created_by_profile?.full_name || "Sistema"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(certificate)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setCertificateToDelete(certificate.id)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta certidão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SendEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        certificates={certificates.filter((cert) => selectedIds.includes(cert.id))}
      />
    </>
  )
}
