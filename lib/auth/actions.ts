"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string
  cnpj?: string
  company_name?: string
  created_at: string
  updated_at: string
}

export async function requireAuth(): Promise<User> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile from profiles table
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    redirect("/auth/login?error=profile_not_found")
  }

  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    role: profile.role,
    company_id: profile.company_id,
    cnpj: profile.cnpj,
    company_name: profile.company_name,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
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

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Login error:", error.message)

    // Provide more specific error messages in Portuguese
    let errorMessage = "Credenciais inválidas"

    if (error.message.includes("Email not confirmed")) {
      errorMessage = "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação."
    } else if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Email ou senha incorretos. Verifique suas credenciais e tente novamente."
    } else if (error.message.includes("Too many requests")) {
      errorMessage = "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente."
    } else if (error.message.includes("User not found")) {
      errorMessage = "Usuário não encontrado. Verifique se você já se cadastrou."
    }

    return {
      success: false,
      error: errorMessage,
    }
  }

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}
