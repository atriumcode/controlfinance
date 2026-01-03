"use server"

import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { hashPassword, verifyPassword, validatePassword } from "./password"
import {
  createSession,
  deleteSession,
  requireAuth as requireAuthSession,
} from "./session"

/* =======================
   TYPES
======================= */

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string | null
  is_active: boolean
}

/* =======================
   AUTH GUARD
======================= */

export async function requireAuth(): Promise<User> {
  const user = await requireAuthSession()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

/* =======================
   REGISTER USER (ADMIN)
======================= */

export async function registerUserAction(data: {
  email: string
  password: string
  fullName: string
  role: string
  companyId: string
}) {
  const { email, password, fullName, role, companyId } = data

  if (!email || !password || !fullName || !companyId) {
    return { success: false, error: "Preencha todos os campos obrigatórios" }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }

  try {
    const supabase = createAdminClient()

    // Conta usuários DA EMPRESA
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)

    const isFirstUser = count === 0

    // Verificar duplicidade de email
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (existingUser) {
      return { success: false, error: "Este email já está cadastrado" }
    }

    const passwordHash = await hashPassword(password)
    const finalRole = isFirstUser ? "admin" : role || "user"

    const { data: newUser, error } = await supabase
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

    if (error || !newUser) {
      console.error(error)
      return { success: false, error: "Erro ao criar usuário" }
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Erro inesperado ao criar usuário" }
  }
}

/* =======================
   LOGIN
======================= */

export async function loginUserAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email e senha são obrigatórios" }
  }

  try {
    const supabase = createAdminClient()

    let { data: user } = await supabase
      .from("profiles")
      .select("id, email, password_hash, is_active, company_id, role")
      .eq("email", email)
      .single()

    // Criar profile automaticamente se não existir
    if (!user) {
      const { data: newUser, error } = await supabase
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

      if (error || !newUser) {
        console.error(error)
        return { success: false, error: "Erro ao inicializar usuário" }
      }

      user = newUser
    }

    if (!user.is_active) {
      return { success: false, error: "Usuário inativo" }
    }

    if (user.password_hash) {
      const valid = await verifyPassword(password, user.password_hash)
      if (!valid) {
        return { success: false, error: "Email ou senha incorretos" }
      }
    }

    await supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString() })
      .eq("id", user.id)

    await createSession(user.id)

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Erro ao fazer login" }
  }
}

/* =======================
   ONBOARDING (EMPRESA)
======================= */

export async function createCompanyOnboardingAction(data: {
  name: string
  cnpj?: string
  email?: string
}) {
  if (!data.name) {
    return { success: false, error: "Nome da empresa é obrigatório" }
  }

  try {
    const supabase = createAdminClient()
    const user = await requireAuthSession()

    if (!user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    let companyId: string | null = null

    // Procurar empresa existente pelo nome
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", data.name)
      .single()

    if (existingCompany) {
      companyId = existingCompany.id
    }

    // Criar se não existir
    if (!companyId) {
      const { data: newCompany, error } = await supabase
        .from("companies")
        .insert({
          name: data.name,
          cnpj: data.cnpj || null,
          email: data.email || null,
        })
        .select()
        .single()

      if (error || !newCompany) {
        console.error(error)
        return { success: false, error: "Erro ao criar empresa" }
      }

      companyId = newCompany.id
    }

    // Associar usuário
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ company_id: companyId })
      .eq("id", user.id)

    if (profileError) {
      console.error(profileError)
      return { success: false, error: "Erro ao associar empresa" }
    }

    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Erro no onboarding" }
  }
}

/* =======================
   LOGOUT
======================= */

export async function logoutAction() {
  await deleteSession()
  redirect("/auth/login")
}
