"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { validateCPF, validateCNPJ, formatCPF, formatCNPJ } from "@/lib/utils/document-validation"

interface ClientFormProps {
  client?: {
    id: string
    name: string
    cpf_cnpj: string
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
    cpf_cnpj: client?.cpf_cnpj || "",
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
    const cleanValue = value.replace(/\D/g, "")

    let formatted = value
    if (cleanValue.length <= 11) {
      formatted = formatCPF(cleanValue)
    } else {
      formatted = formatCNPJ(cleanValue)
    }

    setFormData({ ...formData, cpf_cnpj: formatted })
  }

  const validateDocument = () => {
    const cleanDocument = formData.cpf_cnpj.replace(/\D/g, "")

    if (cleanDocument.length === 11) {
      return validateCPF(cleanDocument)
    } else if (cleanDocument.length === 14) {
      return validateCNPJ(cleanDocument)
    }
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateDocument()) {
      const cleanDocument = formData.cpf_cnpj.replace(/\D/g, "")
      const docType = cleanDocument.length === 11 ? "CPF" : "CNPJ"
      setError(`${docType} inválido`)
      setIsLoading(false)
      return
    }

    try {
      const cleanDocument = formData.cpf_cnpj.replace(/\D/g, "")
      const paddedDocument =
        cleanDocument.length === 11 ? cleanDocument.padStart(11, "0") : cleanDocument.padStart(14, "0")

      const clientData = {
        ...formData,
        cpf_cnpj: paddedDocument,
      }

      console.log("[v0] Submitting client data:", clientData)

      const url = client ? `/api/clients/${client.id}` : "/api/clients"
      const method = client ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao salvar cliente")
      }

      console.log("[v0] Client saved successfully")
      router.push("/dashboard/clients")
      router.refresh()
    } catch (error: unknown) {
      console.error("[v0] Error saving client:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar cliente")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {client ? "Editar Cliente" : "Novo Cliente"}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {client ? "Atualize as informações do cliente" : "Preencha os dados do novo cliente"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf_cnpj">CPF/CNPJ *</Label>
              <Input
                id="cpf_cnpj"
                required
                value={formData.cpf_cnpj}
                onChange={(e) => handleDocumentChange(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="Ex: SP, RJ, MG"
              maxLength={2}
              className="border-gray-300"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
              {isLoading ? "Salvando..." : client ? "Atualizar" : "Salvar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/clients")}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
