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

export async function updateCompany(input: UpdateCompanyInput) {
  const user = await getAuthenticatedUser()

  if (!user?.company_id) {
    throw new Error("Usuário não autorizado")
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
    throw new Error("Erro ao salvar empresa")
  }
}

export async function uploadCompanyLogo(file: File) {
  const user = await getAuthenticatedUser()

  if (!user?.company_id) {
    throw new Error("Usuário não autorizado")
  }

  const supabase = createAdminClient()

  const ext = file.name.split(".").pop()
  const filePath = `logos/${user.company_id}.${ext}`

  const { error } = await supabase.storage
    .from("companies")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    console.error("[uploadCompanyLogo]", error)
    throw new Error("Erro ao enviar logo")
  }

  const { data } = supabase.storage
    .from("companies")
    .getPublicUrl(filePath)

  return data.publicUrl
}
