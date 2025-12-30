import { redirect } from "next/navigation"
import type { UserRole } from "./roles"
import { getAuthenticatedUser } from "./server-auth"

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  company_id: string
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const user = await getAuthenticatedUser()

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    full_name: user.full_name,
    company_id: user.company.id,
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
  return requireRole("admin")
}
