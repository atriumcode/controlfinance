"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"
import { toast } from "sonner"

interface Certificate {
  id: string
  name: string
  file_url: string
}

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certificates: Certificate[]
}

export function SendEmailDialog({ open, onOpenChange, certificates }: SendEmailDialogProps) {
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("Certidões - Envio de Documentos")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || certificates.length === 0) {
      toast.error("Preencha o email e selecione ao menos uma certidão")
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/certificates/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email,
          subject,
          message,
          certificates: certificates.map((cert) => ({
            name: cert.name,
            url: cert.file_url,
          })),
        }),
      })

      if (!response.ok) throw new Error()

      toast.success("Email enviado com sucesso")
      onOpenChange(false)
      setEmail("")
      setMessage("")
    } catch (error) {
      toast.error("Erro ao enviar email")
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Certidões por Email</DialogTitle>
          <DialogDescription>
            Enviar {certificates.length} certidão{certificates.length !== 1 ? "ões" : ""} selecionada
            {certificates.length !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Destinatário *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              disabled={sending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Adicione uma mensagem opcional"
              disabled={sending}
              rows={4}
            />
          </div>

          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm font-medium mb-2">Arquivos anexados:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {certificates.map((cert) => (
                <li key={cert.id}>• {cert.name}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              <Mail className="mr-2 h-4 w-4" />
              {sending ? "Enviando..." : "Enviar Email"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
