"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { verifyPassword, hashPassword, validatePassword } from "@/lib/auth/password"
import { requireAuth } from "@/lib/auth/actions"
import { revalidatePath } from "next/cache"

export async function updateOwnProfileAction(data: {
  fullName: string
}) {
  const user = await requireAuth()

  if (!data.fullName) {
    return { success: false, error: "Nome é obrigatório" }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: "Erro ao atualizar perfil" }
  }

  revalidatePath("/dashboard/settings/profile")

  return { success: true }
}

export async function changeOwnPasswordAction(data: {
  currentPassword: string
  newPassword: string
}) {
  const user = await requireAuth()

  if (!data.currentPassword || !data.newPassword) {
    return { success: false, error: "Preencha todos os campos" }
  }

  const passwordValidation = validatePassword(data.newPassword)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  const supabase = createAdminClient()

  // Buscar hash atual
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("password_hash")
    .eq("id", user.id)
    .single()

  if (error || !profile?.password_hash) {
    return { success: false, error: "Erro ao validar senha atual" }
  }

  const validCurrent = await verifyPassword(
    data.currentPassword,
    profile.password_hash
  )

  if (!validCurrent) {
    return { success: false, error: "Senha atual incorreta" }
  }

  const newHash = await hashPassword(data.newPassword)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      password_hash: newHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    return { success: false, error: "Erro ao alterar senha" }
  }

  revalidatePath("/dashboard/settings/profile")

  return { success: true }
}
