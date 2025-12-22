"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"

/* ===================== TYPES ===================== */

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
  logo_url?: string
}

interface CompanyFormProps {
  company?: Company | null
}

/* ===================== COMPONENT ===================== */

export function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(
    company?.logo_url ?? null
  )

  const [formData, setFormData] = useState<Company>({
    name: company?.name ?? "",
    cnpj: company?.cnpj ?? "",
    email: company?.email ?? "",
    phone: company?.phone ?? "",
    address: company?.address ?? "",
    city: company?.city ?? "",
    state: company?.state ?? "",
    zip_code: company?.zip_code ?? "",
    logo_url: company?.logo_url ?? "",
  })

  /* ===================== LOGO ===================== */

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "Imagem deve ter no máximo 2MB",
        variant: "destructive",
      })
      return
    }

    setUploadingLogo(true)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      setFormData((prev) => ({ ...prev, logo_url: base64 }))
      setUploadingLogo(false)
    }

    reader.onerror = () => {
      toast({
        title: "Erro",
        description: "Erro ao carregar imagem",
        variant: "destructive",
      })
      setUploadingLogo(false)
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData((prev) => ({ ...prev, logo_url: "" }))
  }

  /* ===================== SUBMIT ===================== */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = company?.id
        ? { ...formData, id: company.id } // PUT
        : formData // POST

      const response = await fetch("/api/company", {
        method: company?.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erro ao salvar empresa")
      }

      toast({
        title: "Sucesso",
        description: "Empresa salva com sucesso",
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar empresa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ===================== UI ===================== */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* LOGO */}
      <div className="space-y-2">
        <Label>Logo da Empresa</Label>

        <div className="flex items-start gap-4">
          {logoPreview ? (
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <Image
                src={logoPreview}
                alt="Logo da empresa"
                fill
                className="object-contain p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
              <Upload className="text-muted-foreground" />
            </div>
          )}

          <Input
            type="file"
            accept="image/*"
            disabled={uploadingLogo}
            onChange={handleLogoUpload}
          />
        </div>
      </div>

      {/* CAMPOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nome *</Label>
          <Input
            value={formData.name}
            required
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div>
          <Label>CNPJ *</Label>
          <Input
            value={formData.cnpj}
            required
            onChange={(e) =>
              setFormData({ ...formData, cnpj: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Telefone</Label>
          <Input
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label>Endereço</Label>
        <Textarea
          rows={2}
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Cidade"
          value={formData.city}
          onChange={(e) =>
            setFormData({ ...formData, city: e.target.value })
          }
        />
        <Input
          placeholder="Estado"
          value={formData.state}
          onChange={(e) =>
            setFormData({ ...formData, state: e.target.value })
          }
        />
        <Input
          placeholder="CEP"
          value={formData.zip_code}
          onChange={(e) =>
            setFormData({ ...formData, zip_code: e.target.value })
          }
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Empresa"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
