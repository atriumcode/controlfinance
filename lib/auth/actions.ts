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

export async function requireAuth(): Promise<User> {
  return requireAuthSession()
}

export async function registerUserAction(data: RegisterUserInput) {
  const { email, password, fullName, role, companyId } = data

  if (!email || !password || !fullName) {
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
    // Verifica se é o primeiro usuário
    const existingUsers = await query("SELECT id FROM profiles")
    const isFirstUser = !existingUsers || existingUsers.length === 0

    // Verifica e-mail duplicado
    const existingUser = await query("SELECT id FROM profiles WHERE email = $1 LIMIT 1", [email])
    if (existingUser && existingUser.length > 0) {
      return {
        success: false,
        error: "Este email já está cadastrado",
      }
    }

    const passwordHash = await hashPassword(password)

    const finalRole = isFirstUser ? "admin" : role || "user"
    const finalCompanyId = isFirstUser ? null : companyId

    const newUsers = await query(
      `
      INSERT INTO profiles (email, full_name, role, company_id, password_hash, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [email, fullName, finalRole, finalCompanyId, passwordHash, true],
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
      error: "Erro ao criar usuário.",
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
    const users = await query(
      "SELECT id, email, password_hash, is_active FROM profiles WHERE email = $1 LIMIT 1",
      [email]
    )

    const user = users && users.length > 0 ? users[0] : null

    if (!user) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    if (!user.is_active) {
      return {
        success: false,
        error: "Usuário inativo.",
      }
    }

    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return {
        success: false,
        error: "Email ou senha incorretos",
      }
    }

    await execute("UPDATE profiles SET last_login = $1 WHERE id = $2", [
      new Date().toISOString(),
      user.id,
    ])

    await createSession(user.id)

    return { success: true }
  } catch (error) {
    console.error("[v0] Login exception:", error)
    return {
      success: false,
      error: "Erro ao fazer login.",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    }
  }
}

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
