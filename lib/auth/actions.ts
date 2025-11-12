"use server"

import { query, execute } from "@/lib/db/postgres"
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
    const existingUsers = await query("SELECT id FROM profiles")
    const isFirstUser = !existingUsers || existingUsers.length === 0

    const existingUser = await query("SELECT id FROM profiles WHERE email = $1 LIMIT 1", [email])

    if (existingUser && existingUser.length > 0) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      }
    }

    const passwordHash = await hashPassword(password)
    const finalRole = isFirstUser ? "admin" : role || "user"

    const newUsers = await query(
      `INSERT INTO profiles (email, full_name, role, cnpj, password_hash, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [email, fullName, finalRole, cnpj || null, passwordHash, true],
    )

    if (!newUsers || newUsers.length === 0) {
      return {
        success: false,
        error: "Erro ao criar usuário. Tente novamente.",
      }
    }

    await createSession(newUsers[0].id)

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
    const users = await query("SELECT id, email, password_hash, is_active FROM profiles WHERE email = $1 LIMIT 1", [
      email,
    ])

    console.log("[v0] Database query result - users found:", users?.length || 0)

    const user = users && users.length > 0 ? users[0] : null

    if (!user) {
      console.log("[v0] User not found for email:", email)
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

    const isPasswordValid = await verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    await execute("UPDATE profiles SET last_login = $1 WHERE id = $2", [new Date().toISOString(), user.id])

    await createSession(user.id)

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
