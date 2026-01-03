"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { hashPassword, verifyPassword, validatePassword } from "./password"
import { createSession, deleteSession, requireAuth as requireAuthSession } from "./session"

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string | null
  is_active: boolean
}

export async function requireAuth(): Promise<User> {
  const user = await requireAuthSession()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function registerUserAction(data: {
  email: string
  password: string
  fullName: string
  role: string
  companyId: string
}) {
  const { email, password, fullName, role, companyId } = data

  // Validações
  if (!email || !password || !fullName || !companyId) {
    return {
      success: false,
      error: "Preencha todos os campos obrigatórios",
    }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.error,
    }
  }


  try {
    const supabase = createAdminClient()

    const { data: existingUsers, error: countError } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking users:", countError)

      // Check if table doesn't exist
      if (countError.code === "42P01" || countError.message.includes("does not exist")) {
        return {
          success: false,
          error: "Sistema não configurado. Execute o script SQL primeiro.",
          details: "Tabela 'profiles' não existe no banco de dados",
        }
      }
    }

    const isFirstUser = !countError && (!existingUsers || existingUsers.length === 0)

    // Verificar se o email já existe
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      }
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    const finalRole = isFirstUser ? "admin" : role || "user"

    // Criar usuário
    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert({
      email,
      full_name: fullName,
      role: finalRole,
      company_id: companyId,
      password_hash: passwordHash,
      is_active: true,
    })
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return {
        success: false,
        error: "Erro ao criar usuário. Tente novamente.",
        details: insertError.message,
      }
    }

    // Criar sessão automaticamente
    await createSession(newUser.id)

    return {
      success: true,
      isFirstUser,
    }
  } catch (error) {
    console.error("Registration exception:", error)
    return {
      success: false,
      error: "Erro ao criar usuário. Tente novamente.",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function loginUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email e senha são obrigatórios",
    }
  }

  try {
    const supabase = createAdminClient()

    // 🔎 Buscar profile
    let { data: user } = await supabase
      .from("profiles")
      .select("id, email, password_hash, is_active, company_id, role")
      .eq("email", email)
      .single()

    // ❌ Não existe profile → cria automaticamente (SEM senha)
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from("profiles")
        .insert({
          email,
          full_name: email.split("@")[0],
          role: "admin",
          company_id: null,
          is_active: true,
        })
        .select()
        .single()

      if (insertError || !newUser) {
        console.error("Erro ao criar profile automático:", insertError)
        return {
          success: false,
          error: "Erro ao inicializar usuário no sistema",
        }
      }

      user = newUser
    }

    // 🔒 Verificar se está ativo
    if (!user.is_active) {
      return {
        success: false,
        error: "Usuário inativo. Entre em contato com o administrador.",
      }
    }

    // 🔑 Verificar senha (somente se existir hash)
    if (user.password_hash) {
      const isPasswordValid = await verifyPassword(password, user.password_hash)

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Email ou senha incorretos",
        }
      }
    }

    // 🕒 Atualizar último login
    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id)

    // 🔐 Criar sessão
    await createSession(user.id)

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Erro ao fazer login. Tente novamente.",
    }
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
