"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export interface UpdateCompanyInput {
  name: string
  cnpj: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  logo_url?: string
}

/* ===================== UPDATE COMPANY ===================== */

export async function updateCompany(input: UpdateCompanyInput) {
  const user = await getAuthenticatedUser()

  if (!user?.company?.id) {
    throw new Error("Usuário sem empresa vinculada")
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("companies")
    .update({
      name: input.name,
      cnpj: input.cnpj,
      email: input.email,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      zip_code: input.zip_code,
      logo_url: input.logo_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.company.id)

  if (error) {
    console.error("[updateCompany]", error)
    throw new Error(error.message)
  }
}

/* ===================== UPLOAD LOGO ===================== */

export async function uploadCompanyLogo(file: File) {
  const user = await getAuthenticatedUser() // ✅ CORREÇÃO AQUI

  if (!user?.company?.id) {
    throw new Error("Usuário sem empresa vinculada")
  }

  if (!file) {
    throw new Error("Arquivo não informado")
  }

  const supabase = createAdminClient()

  const ext = file.name.split(".").pop()
  const filePath = `logos/${user.company.id}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("companies")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    console.error("[uploadCompanyLogo]", uploadError)
    throw new Error("Erro ao enviar logo")
  }

  const { data } = supabase.storage
    .from("companies")
    .getPublicUrl(filePath)

  return data.publicUrl
}
