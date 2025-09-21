"use client"

import type { User } from "./actions"

// Client-side utilities for authentication
export async function registerUser(userData: {
  email: string
  password: string
  full_name: string
  company_name?: string
  cnpj?: string
  role: string
}) {
  const formData = new FormData()
  formData.append("email", userData.email)
  formData.append("password", userData.password)
  formData.append("full_name", userData.full_name)
  formData.append("company_name", userData.company_name || "")
  formData.append("cnpj", userData.cnpj || "")
  formData.append("role", userData.role)

  // Import the server action dynamically to avoid build issues
  const { registerUserAction } = await import("./actions")
  return await registerUserAction(formData)
}

export async function loginUser(email: string, password: string) {
  const formData = new FormData()
  formData.append("email", email)
  formData.append("password", password)

  // Import the server action dynamically to avoid build issues
  const { loginUserAction } = await import("./actions")
  return await loginUserAction(formData)
}

export async function logoutUser() {
  // Import the server action dynamically to avoid build issues
  const { logoutUserAction } = await import("./actions")
  return await logoutUserAction()
}

// Client-side function to get current user (calls server action)
export async function getCurrentUser(): Promise<User | null> {
  try {
    // This will need to be called from a server component or server action
    // For client components, we'll use a different approach
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Helper function to check if user has role
export function hasRole(user: User | null, roles: string | string[]): boolean {
  if (!user) return false
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  return allowedRoles.includes(user.role)
}
