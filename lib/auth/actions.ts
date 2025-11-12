"use server"

import { createAdminClient } from "@/lib/db/client"
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
  return requireAuthSession()
}

export async function registerUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as string
  const cnpj = formData.get("cnpj") as string
  const companyName = formData.get("companyName") as string

  // Validações
  if (!email || !password || !fullName) {
    return {
      success: false,
      error: "Preencha todos os campos obrigatórios",
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "As senhas não coincidem",
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
    const db = createAdminClient()

    const { data: existingUsers, error: countError } = await db.from("profiles").select("id").execute()

    if (countError) {
      console.error("Error checking users:", countError)
      return {
        success: false,
        error: "Sistema não configurado. Execute o script SQL primeiro.",
        details: "Erro ao acessar tabela 'profiles'",
      }
    }

    const isFirstUser = !existingUsers || existingUsers.length === 0

    // Verificar se o email já existe
    const { data: existingUser, error: checkError } = await db
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()
      .execute()

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
    const { data: newUser, error: insertError } = await db
      .from("profiles")
      .insert({
        email,
        full_name: fullName,
        role: finalRole,
        cnpj: cnpj || null,
        password_hash: passwordHash,
        is_active: true,
      })
      .execute()

    if (insertError || !newUser || newUser.length === 0) {
      console.error("Insert error:", insertError)
      return {
        success: false,
        error: "Erro ao criar usuário. Tente novamente.",
        details: insertError?.message,
      }
    }

    // Criar sessão automaticamente
    await createSession(newUser[0].id)

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

  console.log("[v0] Login attempt for email:", email)

  if (!email || !password) {
    return {
      success: false,
      error: "Email e senha são obrigatórios",
    }
  }

  try {
    const db = createAdminClient()

    console.log("[v0] Querying database for user...")

    // Buscar usuário
    const { data: users, error: userError } = await db
      .from("profiles")
      .select("id, email, password_hash, is_active")
      .eq("email", email)
      .execute()

    console.log("[v0] Database query result - users found:", users?.length || 0)
    console.log("[v0] Database query error:", userError)

    if (userError) {
      console.error("Database error:", userError)
      return {
        success: false,
        error: "Sistema não configurado. Execute o script SQL primeiro.",
        details: "Erro ao acessar tabela 'profiles'",
      }
    }

    const user = users && users.length > 0 ? users[0] : null

    if (!user) {
      console.log("[v0] User not found for email:", email)
      return {
        success: false,
        error: "Email ou senha incorretos",
        details: "Usuário não encontrado no banco de dados",
      }
    }

    console.log("[v0] User found, checking if active...")

    if (!user.is_active) {
      return {
        success: false,
        error: "Usuário inativo. Entre em contato com o administrador.",
      }
    }

    console.log("[v0] Verifying password...")

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    console.log("[v0] Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email ou senha incorretos",
        details: "Senha não corresponde ao hash armazenado",
      }
    }

    console.log("[v0] Updating last login and creating session...")

    // Atualizar último login
    await db.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id).execute()

    // Criar sessão
    await createSession(user.id)

    console.log("[v0] Login successful!")

    return {
      success: true,
    }
  } catch (error) {
    console.error("[v0] Login exception:", error)
    return {
      success: false,
      error: "Erro ao fazer login. Tente novamente.",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
