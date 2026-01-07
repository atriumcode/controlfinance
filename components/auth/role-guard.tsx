
"use client"

console.log("[ROLE_GUARD_LOADED]")


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
  /**
   * ⚠️ redirectTo SÓ deve ser usado dentro do Dashboard
   * Nunca use redirectTo em páginas fora do dashboard
   */
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)
  const router = useRouter()

  // 🔍 Busca usuário logado (NÃO redireciona se não existir)
  const checkUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("[RoleGuard] Erro ao obter usuário:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-slate-600">Carregando...</span>
      </div>
    )
  }

  // 🚫 Usuário não autenticado → NÃO redireciona aqui
  if (!user) {
    return fallback
  }

  // 🔐 Validação de ROLE
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]

    if (!hasRole(user, allowedRoles)) {
      if (redirectTo && !hasRedirected) {
        setHasRedirected(true)
        router.push(redirectTo)
        return null
      }
      return fallback
    }
  }

  // 🔐 Validação de PERMISSÃO
  if (requiredPermission) {
    const allowed = hasPermission(
      user.role,
      requiredPermission as any
    )

    if (!allowed) {
      if (redirectTo && !hasRedirected) {
        setHasRedirected(true)
        router.push(redirectTo)
        return null
      }
      return fallback
    }
  }

  // ✅ Tudo OK
  return <>{children}</>
}

/**
 * Hook auxiliar para uso em componentes
 * (não faz redirect)
 */
export function useRoleGuard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("[useRoleGuard] Erro:", error)
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
      const allowedRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole]
      return hasRole(user, allowedRoles)
    },
    [user]
  )

  const hasRequiredPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      return hasPermission(user.role, permission as any)
    },
    [user]
  )

  return {
    user,
    loading,
    hasRequiredRole,
    hasRequiredPermission,
  }
}
