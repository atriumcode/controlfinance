"use client"

import type { User } from "./actions"

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/user/profile")
    if (!response.ok) return null

    const profile = await response.json()
    if (!profile) return null

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      company_id: profile.company_id,
      cnpj: profile.cnpj,
      is_active: profile.is_active,
    }
  } catch (error) {
    return null
  }
}

export function hasRole(user: User, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role)
}
