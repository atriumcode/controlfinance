"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth/simple-auth"
import type { User } from "@/lib/auth/simple-auth"
import { hasPermission } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/auth/roles"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  requiredPermission?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div className="p-4 text-center text-red-600">Acesso negado</div>,
  redirectTo,
}: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)
  const router = useRouter()

  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)

      if (!currentUser && redirectTo && !hasRedirected) {
        setHasRedirected(true)
        router.push(redirectTo)
      }
    } catch (error) {
      console.error("[v0] Error checking user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [redirectTo, hasRedirected, router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  useEffect(() => {
    if (!loading && !user && redirectTo && !hasRedirected) {
      setHasRedirected(true)
      router.push(redirectTo)
    }
  }, [loading, user, redirectTo, hasRedirected, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600">Carregando...</span>
      </div>
    )
  }

  if (!user) {
    return fallback
  }

  // Check role requirement
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!hasRole(user, allowedRoles)) {
      if (redirectTo && !hasRedirected) {
        setHasRedirected(true)
        router.push(redirectTo)
        return null
      }
      return fallback
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(user.role, requiredPermission as any)) {
    if (redirectTo && !hasRedirected) {
      setHasRedirected(true)
      router.push(redirectTo)
      return null
    }
    return fallback
  }

  return <>{children}</>
}

// Hook for using role guard in components
export function useRoleGuard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("[v0] Error checking user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const hasRequiredRole = useCallback(
    (requiredRole: UserRole | UserRole[]) => {
      if (!user) return false
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      return hasRole(user, allowedRoles)
    },
    [user],
  )

  const hasRequiredPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      return hasPermission(user.role, permission as any)
    },
    [user],
  )

  return {
    user,
    loading,
    hasRequiredRole,
    hasRequiredPermission,
  }
}
