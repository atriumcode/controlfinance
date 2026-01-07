"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, hasRole } from "@/lib/auth/client"
import type { User } from "@/lib/auth/actions"
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
  fallback = (
    <div className="p-4 text-center text-red-600">
      Acesso negado
    </div>
  ),
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // 1️⃣ Carrega usuário
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // 2️⃣ Decide se precisa redirecionar (SEM executar ainda)
  useEffect(() => {
    if (loading || !redirectTo) return

    if (!user) return

    if (requiredRole) {
      const roles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole]

      if (!hasRole(user, roles)) {
        setShouldRedirect(true)
      }
    }

    if (requiredPermission) {
      if (!hasPermission(user.role, requiredPermission as any)) {
        setShouldRedirect(true)
      }
    }
  }, [loading, user, requiredRole, requiredPermission, redirectTo])

  // 3️⃣ Executa redirect (SIDE EFFECT CORRETO)
  useEffect(() => {
    if (shouldRedirect && redirectTo) {
      router.push(redirectTo)
    }
  }, [shouldRedirect, redirectTo, router])

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-slate-600">Carregando…</span>
      </div>
    )
  }

  // 🚫 Sem usuário → apenas fallback
  if (!user) {
    return fallback
  }

  // 🚫 Sem permissão → fallback (redirect ocorre via useEffect)
  if (shouldRedirect) {
    return fallback
  }

  return <>{children}</>
}
