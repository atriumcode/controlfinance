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

// Mapeia roles da UI para roles aceitas no banco
function mapRole(uiRole: string): "admin" | "user" | "viewer" {
  switch (uiRole) {
    case "administrador":
      return "admin"
    case "escrita":
      return "user"
    case "leitura":
      return "viewer"
    default:
      return "viewer"
  }
}

export async function requireAuth(): Promise<User> {
  return requireAuthSession()
}

// REGISTRO DE USUÁRIO COM ROLE CORRIGIDA
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
    // Garantir que o role enviado existe no banco
    const dbRole = mapRole(role)

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

    const hash = await hashPassword(password)

    const newUser = await query(
      `
      INSERT INTO profiles (email, full_name, role, company_id, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING id
      `,
      [email, fullName, dbRole, companyId, hash]
    )

    await createSession(newUser[0].id)

    return { success: true }

  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return { success: false, error: "Erro ao criar usuário." }
  }
}

export async function loginUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email e senha obrigatórios." }
  }

  try {
    const users = await query(
      "SELECT id, email, password_hash, is_active FROM profiles WHERE email = $1 LIMIT 1",
      [email]
    )

    const user = users[0]
    if (!user) return { success: false, error: "Email ou senha incorretos." }

    if (!user.is_active) {
      return { success: false, error: "Usuário inativo." }
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return { success: false, error: "Email ou senha incorretos." }
    }

    await execute(
      "UPDATE profiles SET last_login = $1 WHERE id = $2",
      [new Date().toISOString(), user.id]
    )

    await createSession(user.id)

    return { success: true }

  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return { success: false, error: "Erro ao fazer login." }
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
