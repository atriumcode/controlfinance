"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/actions"
import { hashPassword, validatePassword } from "@/lib/auth/password"
import { revalidatePath } from "next/cache"

const ALLOWED_ROLES = [
  "admin",
  "manager",
  "user",
  "accountant",
  "viewer",
] as const

// ======================
// EDITAR USUÁRIO
// ======================
export async function updateUserAction(data: {
  userId: string
  fullName: string
  role: string
  isActive: boolean
}) {
  const currentUser = await requireAuth()

  if (!currentUser || !currentUser.company_id) {
    return { success: false, error: "Usuário sem empresa vinculada" }
  }

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  if (!ALLOWED_ROLES.includes(data.role as any)) {
    return { success: false, error: "Perfil de acesso inválido" }
  }

  if (currentUser.id === data.userId && !data.isActive) {
    return { success: false, error: "Você não pode desativar a si mesmo" }
  }

  if (currentUser.id === data.userId && data.role !== currentUser.role) {
    return {
      success: false,
      error: "Você não pode alterar seu próprio nível de acesso",
    }
  }

  const supabase = createAdminClient()

  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.userId)
    .eq("company_id", currentUser.company_id)
    .single()

  if (!targetUser) {
    return { success: false, error: "Usuário não encontrado" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      role: data.role,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.userId)
    .eq("company_id", currentUser.company_id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao atualizar usuário" }
  }

  revalidatePath("/dashboard/users")
  return { success: true }
}

// ======================
// TROCAR SENHA
// ======================
export async function changeUserPasswordAction(data: {
  userId: string
  newPassword: string
}) {
  const currentUser = await requireAuth()

  if (!currentUser || !currentUser.company_id) {
    return { success: false, error: "Usuário sem empresa vinculada" }
  }

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  if (currentUser.id === data.userId) {
    return {
      success: false,
      error: "Use a opção de alterar sua própria senha",
    }
  }

  const passwordValidation = validatePassword(data.newPassword)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  const passwordHash = await hashPassword(data.newPassword)
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.userId)
    .eq("company_id", currentUser.company_id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao trocar senha" }
  }

  return { success: true }
}

// ======================
// DESATIVAR USUÁRIO
// ======================
export async function deactivateUserAction(userId: string) {
  const currentUser = await requireAuth()

  if (!currentUser || !currentUser.company_id) {
    return { success: false, error: "Usuário sem empresa vinculada" }
  }

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  if (currentUser.id === userId) {
    return { success: false, error: "Você não pode desativar a si mesmo" }
  }

  const supabase = createAdminClient()

  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("company_id", currentUser.company_id)
    .eq("role", "admin")
    .eq("is_active", true)

  if (count === 1) {
    return {
      success: false,
      error: "Não é possível desativar o único administrador da empresa",
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("company_id", currentUser.company_id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao desativar usuário" }
  }

  return { success: true }
}

// ======================
// DELETAR USUÁRIO
// ======================
export async function deleteUserAction(userId: string) {
  const currentUser = await requireAuth()

  if (!currentUser || !currentUser.company_id) {
    return { success: false, error: "Usuário sem empresa vinculada" }
  }

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)
    .eq("company_id", currentUser.company_id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/users")
  return { success: true }
}
