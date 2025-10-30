"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ } from "@/lib/utils/document-validation"

interface ClientFormProps {
  client?: {
    id: string
    name: string
    document: string
    document_type: "cpf" | "cnpj"
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || "",
    document: client?.document || "",
    document_type: client?.document_type || ("cpf" as "cpf" | "cnpj"),
    email: client?.email || "",
    phone: client?.phone || "",
    address: client?.address || "",
    city: client?.city || "",
    state: client?.state || "",
    zip_code: client?.zip_code || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDocumentChange = (value: string) => {
    let formatted = value.replace(/\D/g, "")

    if (formData.document_type === "cpf") {
      formatted = formatCPF(formatted)
    } else {
      formatted = formatCNPJ(formatted)
    }

    setFormData({ ...formData, document: formatted })
  }

  const handleDocumentTypeChange = (type: "cpf" | "cnpj") => {
    setFormData({ ...formData, document_type: type, document: "" })
  }

  const validateDocument = () => {
    const cleanDocument = formData.document.replace(/\D/g, "")

    if (formData.document_type === "cpf") {
      return validateCPF(cleanDocument)
    } else {
      return validateCNPJ(cleanDocument)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateDocument()) {
      setError(`${formData.document_type.toUpperCase()} inválido`)
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const response = await fetch("/api/user/profile")
      if (!response.ok) throw new Error("Usuário não autenticado")

      const { company_id } = await response.json()
      if (!company_id) throw new Error("Empresa não encontrada")

      const clientData = {
        ...formData,
        document: formData.document.replace(/\D/g, ""), // Store clean document
        company_id,
      }

      if (client) {
        // Update existing client
        const { error } = await supabase.from("clients").update(clientData).eq("id", client.id)

        if (error) throw error
      } else {
        // Create new client
        const { error } = await supabase.from("clients").insert([clientData])

        if (error) throw error
      }

      router.push("/dashboard/clients")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? "Editar Cliente" : "Novo Cliente"}</CardTitle>
        <CardDescription>
          {client ? "Atualize as informações do cliente" : "Preencha os dados do novo cliente"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_type">Tipo de Documento *</Label>
              <Select value={formData.document_type} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">{formData.document_type === "cpf" ? "CPF" : "CNPJ"} *</Label>
              <Input
                id="document"
                required
                value={formData.document}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder={formData.document_type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : client ? "Atualizar" : "Salvar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/clients")}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
