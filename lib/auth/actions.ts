"use server"

import { createClient } from "@/lib/supabase/server"
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
    const supabase = await createClient()

    // Verificar se o email já existe
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", email).single()

    if (existingUser) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      }
    }

    // Hash da senha
    const passwordHash = await hashPassword(password)

    // Criar usuário
    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert({
        email,
        full_name: fullName,
        role: role || "user",
        cnpj: cnpj || null,
        company_name: companyName || null,
        password_hash: passwordHash,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Registration error:", insertError)
      return {
        success: false,
        error: "Erro ao criar usuário. Tente novamente.",
      }
    }

    // Criar sessão automaticamente
    await createSession(newUser.id)

    return {
      success: true,
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return {
      success: false,
      error: "Erro ao criar usuário. Tente novamente.",
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
    const supabase = await createClient()

    // Buscar usuário
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, email, password_hash, is_active")
      .eq("email", email)
      .single()

    if (userError || !user) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    if (!user.is_active) {
      return {
        success: false,
        error: "Usuário inativo. Entre em contato com o administrador.",
      }
    }

    // Verificar senha
    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    // Atualizar último login
    await supabase.from("profiles").update({ last_login: new Date().toISOString() }).eq("id", user.id)

    // Criar sessão
    await createSession(user.id)

    return {
      success: true,
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
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
