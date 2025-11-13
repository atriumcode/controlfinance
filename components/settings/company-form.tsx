"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Company {
  id?: string
  name: string
  cnpj: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip_code: string
}

interface CompanyFormProps {
  company?: Company | null
  userId: string
  profileId?: string
}

export function CompanyForm({ company, userId, profileId }: CompanyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: company?.name || "",
    cnpj: company?.cnpj || "",
    email: company?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    city: company?.city || "",
    state: company?.state || "",
    zip_code: company?.zip_code || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = company?.id ? `/api/companies/${company.id}` : "/api/companies"
      const method = company?.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao salvar dados da empresa")
      }

      toast({
        title: "Sucesso",
        description: "Dados da empresa salvos com sucesso!",
      })

      window.location.href = "/dashboard"
    } catch (error) {
      console.error("Error saving company:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar dados da empresa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Informações da Empresa</h3>
        <p className="text-sm text-muted-foreground">Configure os dados da sua empresa para emissão de faturas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome da Empresa *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Endereço</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="SP"
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor="zip_code">CEP</Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Empresa"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
