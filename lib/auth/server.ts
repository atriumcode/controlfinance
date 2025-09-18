import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { UserRole } from "./roles"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  company_id: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, company_id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    company_id: profile.company_id,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard?error=insufficient-permissions")
  }

  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("administrador")
}
