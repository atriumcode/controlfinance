"use client"

import { createClient } from "@/lib/supabase/client"
import type { User } from "./actions"

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile from profiles table
  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    return null
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

export function hasRole(user: User, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}
