"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"
import Image from "next/image"

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
  userId: string
  profileId?: string
}

export function CompanyForm({ company, userId, profileId }: CompanyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logo_url || null)
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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
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
      const supabase = createBrowserClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${company?.id || userId}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from("company-logos").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("company-logos").getPublicUrl(fileName)

      setLogoPreview(publicUrl)
      setFormData({ ...formData, logo_url: publicUrl })

      toast({
        title: "Sucesso",
        description: "Logo enviada com sucesso!",
      })
    } catch (error) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Erro",
        description: "Erro ao enviar logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData({ ...formData, logo_url: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()

      if (company?.id) {
        // Update existing company
        const { error } = await supabase.from("companies").update(formData).eq("id", company.id)

        if (error) throw error
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert([formData])
          .select()
          .single()

        if (companyError) throw companyError

        // Update or create profile with company_id
        if (profileId) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ company_id: newCompany.id })
            .eq("id", profileId)

          if (profileError) throw profileError
        } else {
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: userId,
              company_id: newCompany.id,
              full_name: "",
              email: "",
              role: "admin",
            },
          ])

          if (profileError) throw profileError
        }
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
        description: "Erro ao salvar dados da empresa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Logo da Empresa</Label>
        <div className="flex items-start gap-4">
          {logoPreview ? (
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
              <Image
                src={logoPreview || "/placeholder.svg"}
                alt="Logo da empresa"
                fill
                className="object-contain p-2"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Recomendado: PNG ou JPG, máximo 2MB. A logo será exibida nos relatórios em PDF.
            </p>
          </div>
        </div>
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
