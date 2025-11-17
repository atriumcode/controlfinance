"use server"

import { query, execute } from "@/lib/db/postgres"
import { redirect } from "next/navigation"
import { hashPassword, verifyPassword, validatePassword } from "./password"
import { createSession, deleteSession, requireAuth as requireAuthSession } from "./session"

export interface RegisterUserInput {
  email: string
  password: string
  fullName: string
  role: string
  companyId: string | null
}

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string | null
  is_active: boolean
}

// Autenticação existente
export async function requireAuth(): Promise<User> {
  return requireAuthSession()
}

// -------- REGISTRO DE USUÁRIO CORRIGIDO ----------
export async function registerUserAction(data: RegisterUserInput) {
  const { email, password, fullName, role, companyId } = data

  if (!email || !password || !fullName || !role) {
    return {
      success: false,
      error: "Preencha todos os campos obrigatórios."
    }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: passwordValidation.error
    }
  }

  try {
    // Checa se email já existe
    const existingUser = await query(
      "SELECT id FROM profiles WHERE email = $1 LIMIT 1",
      [email]
    )

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "Este email já está cadastrado."
      }
    }

    const passwordHash = await hashPassword(password)

    const newUser = await query(
      `
      INSERT INTO profiles (email, full_name, role, company_id, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id
      `,
      [email, fullName, role, companyId, passwordHash]
    )

    await createSession(newUser[0].id)

    return {
      success: true
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return {
      success: false,
      error: "Erro ao criar usuário."
    }
  }
}

// -------- LOGIN ----------
export async function loginUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email e senha são obrigatórios." }
  }

  try {
    const users = await query(
      "SELECT id, email, password_hash, is_active FROM profiles WHERE email = $1 LIMIT 1",
      [email]
    )

    const user = users[0]
    if (!user) {
      return { success: false, error: "Email ou senha incorretos." }
    }

    if (!user.is_active) {
      return { success: false, error: "Usuário inativo." }
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return { success: false, error: "Email ou senha incorretos." }
    }

    await execute("UPDATE profiles SET last_login = $1 WHERE id = $2", [
      new Date().toISOString(),
      user.id
    ])

    await createSession(user.id)

    return { success: true }
  } catch (error) {
    console.error("[v0] LOGIN ERROR:", error)
    return {
      success: false,
      error: "Erro ao fazer login."
    }
  }
}

// -------- LOGOUT ----------
export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
