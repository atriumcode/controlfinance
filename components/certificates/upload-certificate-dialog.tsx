"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UploadCertificateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  userId: string
}

export function UploadCertificateDialog({ open, onOpenChange, companyId, userId }: UploadCertificateDialogProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [expirationDate, setExpirationDate] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Apenas arquivos PDF são permitidos")
        return
      }
      if (selectedFile.size > 3 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 3MB")
        return
      }
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name.replace(".pdf", ""))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file || !name || !expirationDate) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setUploading(true)

    try {
      // Upload do arquivo para Vercel Blob
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Erro ao fazer upload do arquivo")

      const { url } = await uploadResponse.json()

      // Salvar no banco de dados
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          name,
          description,
          file_url: url,
          file_size: file.size,
          expiration_date: expirationDate,
          created_by: userId,
        }),
      })

      if (!response.ok) throw new Error()

      toast.success("Certidão adicionada com sucesso")
      onOpenChange(false)
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao adicionar certidão")
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setFile(null)
      setName("")
      setDescription("")
      setExpirationDate("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Certidão</DialogTitle>
          <DialogDescription>Adicione uma nova certidão negativa ou documento</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Formato:</strong> PDF ou IMG • <strong>Tamanho máximo:</strong> 3MB
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="file"
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Solte seus arquivos aqui ou clique para selecionar</p>
                    <p className="text-xs text-muted-foreground">Apenas arquivos PDF, IMG e com tamanho até 3MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Certidão Negativa Federal"
              disabled={uploading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição opcional"
              disabled={uploading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Data de Vencimento *</Label>
            <Input
              id="expiration"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={uploading}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading ? "Enviando..." : "Adicionar Certidão"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
