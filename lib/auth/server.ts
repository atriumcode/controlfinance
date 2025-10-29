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
  console.log("[v0] getAuthUser - checking custom authentication")

  const user = await getAuthenticatedUser()

  if (!user) {
    console.log("[v0] getAuthUser - no authenticated user found")
    return null
  }

  console.log("[v0] getAuthUser - user found:", {
    id: user.id,
    email: user.email,
    role: user.role,
    company_id: user.company_id,
  })

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    full_name: user.full_name,
    company_id: user.company_id,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) {
    console.log("[v0] requireAuth - redirecting to login")
    redirect("/auth/login")
  }
  return user
}

export async function requireRole(requiredRole: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth()

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  if (!allowedRoles.includes(user.role)) {
    console.log("[v0] requireRole - insufficient permissions, redirecting")
    redirect("/dashboard?error=insufficient-permissions")
  }

  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  console.log("[v0] requireAdmin - checking admin role")
  return requireRole("admin")
}
