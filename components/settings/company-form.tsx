"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

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
  logo_url?: string | null
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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [formData, setFormData] = useState({
    name: company?.name || "",
    cnpj: company?.cnpj || "",
    email: company?.email || "",
    phone: company?.phone || "",
    address: company?.address || "",
    city: company?.city || "",
    state: company?.state || "",
    zip_code: company?.zip_code || "",
    logo_url: company?.logo_url || "",
  })

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida (PNG, JPG, WebP ou GIF)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive",
      })
      return
    }

    setUploadingLogo(true)
    try {
      console.log("[v0] Iniciando upload do arquivo:", file.name)

      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || "Erro ao fazer upload")
      }

      console.log("[v0] Upload concluído:", data.url)

      setFormData((prev) => ({ ...prev, logo_url: data.url }))

      toast({
        title: "Sucesso",
        description: "Logo carregado com sucesso!",
      })
    } catch (error) {
      console.error("[v0] Error uploading logo:", error)
      toast({
        title: "Erro ao fazer upload",
        description: error instanceof Error ? error.message : "Erro desconhecido ao fazer upload do logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Informações da Empresa</h3>
        <p className="text-sm text-gray-600 mt-1">Configure os dados da sua empresa para emissão de faturas</p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="logo" className="text-sm font-medium text-gray-900">
          Logo da Empresa
        </Label>
        <div className="flex items-start gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
            {formData.logo_url ? (
              <img
                src={formData.logo_url || "/placeholder.svg"}
                alt="Logo"
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500">Upload</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="cursor-pointer border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Recomendado: PNG ou JPG, máximo 2MB. A logo será exibida nos relatórios em PDF.
            </p>
            {uploadingLogo && <p className="text-xs text-purple-600">Fazendo upload...</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-900">
            Nome da Empresa *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj" className="text-sm font-medium text-gray-900">
            CNPJ *
          </Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
            required
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
            Telefone
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-900">
          Endereço
        </Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          rows={3}
          className="border-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-gray-900">
            Cidade
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-gray-900">
            Estado
          </Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="SP"
            maxLength={2}
            className="border-gray-300"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_code" className="text-sm font-medium text-gray-900">
            CEP
          </Label>
          <Input
            id="zip_code"
            value={formData.zip_code}
            onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
            placeholder="00000-000"
            className="border-gray-300"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          disabled={loading || uploadingLogo}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
        >
          {loading ? "Salvando..." : "Salvar Empresa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="border-gray-300 bg-transparent"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
