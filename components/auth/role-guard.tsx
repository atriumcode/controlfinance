"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  fallback = <div>Acesso negado</div>,
  redirectTo,
}: RoleGuardProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const checkUserRole = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (redirectTo && !hasRedirected) {
          setHasRedirected(true)
          router.push(redirectTo)
        }
        setLoading(false)
        return
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile) {
        setUserRole(profile.role as UserRole)
      }

      setLoading(false)
    } catch (error) {
      console.error("[v0] Error checking user role:", error)
      setLoading(false)
    }
  }, [supabase, redirectTo, hasRedirected, router])

  useEffect(() => {
    checkUserRole()
  }, [checkUserRole])

  useEffect(() => {
    if (!loading && !userRole && redirectTo && !hasRedirected) {
      setHasRedirected(true)
      router.push(redirectTo)
    }
  }, [loading, userRole, redirectTo, hasRedirected, router])

  if (loading) {
    return <div>Carregando...</div>
  }

  if (!userRole) {
    return fallback
  }

  // Check role requirement
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!allowedRoles.includes(userRole)) {
      if (redirectTo && !hasRedirected) {
        setHasRedirected(true)
        router.push(redirectTo)
        return null
      }
      return fallback
    }
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userRole, requiredPermission as any)) {
    if (redirectTo && !hasRedirected) {
      setHasRedirected(true)
      router.push(redirectTo)
      return null
    }
    return fallback
  }

  return <>{children}</>
}
