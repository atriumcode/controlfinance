"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/actions"
import { hashPassword, validatePassword } from "@/lib/auth/password"
import { revalidatePath } from "next/cache"

// ROLES PERMITIDOS (deve bater com o CHECK do banco)
const ALLOWED_ROLES = [
  "admin",
  "manager",
  "user",
  "accountant",
  "viewer",
] as const

//EDITAR USUÁRIO
export async function updateUserAction(data: {
  userId: string
  fullName: string
  role: string
  isActive: boolean
}) {
  const currentUser = await requireAuth()

  // 1️⃣ Permissão
  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  // 2️⃣ VALIDAR ROLE (OBRIGATÓRIO)
  if (!ALLOWED_ROLES.includes(data.role as any)) {
    return { success: false, error: "Perfil de acesso inválido" }
  }

  // 3️⃣ Impedir desativar a si mesmo
  if (currentUser.id === data.userId && !data.isActive) {
    return { success: false, error: "Você não pode desativar a si mesmo" }
  }

  // 4️⃣ Impedir alterar o próprio role
  if (currentUser.id === data.userId && data.role !== currentUser.role) {
    return {
      success: false,
      error: "Você não pode alterar seu próprio nível de acesso",
    }
  }

  const supabase = createAdminClient()

  // 5️⃣ Garantir que o usuário existe
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.userId)
    .eq("company_id", currentUser.company.id)
    .single()

  if (!targetUser) {
    return { success: false, error: "Usuário não encontrado" }
  }

  // 6️⃣ Atualização
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      role: data.role,
      is_active: data.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.userId)
    .eq("company_id", currentUser.company.id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao atualizar usuário" }
  }

  revalidatePath("/dashboard/users")

  return { success: true }
}

//TROCAR SENHA DO USUÁRIO
export async function changeUserPasswordAction(data: {
  userId: string
  newPassword: string
}) {
  const currentUser = await requireAuth()

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  // 🔒 Impedir trocar a própria senha por aqui (opcional)
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
    .eq("company_id", currentUser.company.id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao trocar senha" }
  }

  return { success: true }
}


//DESTAIVAR USUÁRIO
export async function deactivateUserAction(userId: string) {
  const currentUser = await requireAuth()

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  if (currentUser.id === userId) {
    return { success: false, error: "Você não pode desativar a si mesmo" }
  }

  const supabase = createAdminClient()

  // 🚨 Verificar se é o último admin ativo
  const { count } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("company_id", currentUser.company.id)
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
    .eq("company_id", currentUser.company.id)

  if (error) {
    console.error(error)
    return { success: false, error: "Erro ao desativar usuário" }
  }

  return { success: true }
}

//DELETAR USUARIO
export async function deleteUserAction(userId: string) {
  const currentUser = await requireAuth()

  if (currentUser.role !== "admin") {
    return { success: false, error: "Permissão negada" }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/users")

  return { success: true }
}