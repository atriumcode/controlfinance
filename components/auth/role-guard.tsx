"use client"

import type React from "react"
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
  return <>{children}</>

  // Original code commented out:
  // const [userRole, setUserRole] = useState<UserRole | null>(null)
  // const [loading, setLoading] = useState(true)
  // const router = useRouter()
  //
  // useEffect(() => {
  //   async function checkUserRole() {
  //     const supabase = createClient()
  //
  //     const {
  //       data: { user },
  //     } = await supabase.auth.getUser()
  //     if (!user) {
  //       if (redirectTo) {
  //         router.push(redirectTo)
  //       }
  //       setLoading(false)
  //       return
  //     }
  //
  //     const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  //
  //     if (profile) {
  //       setUserRole(profile.role as UserRole)
  //     }
  //
  //     setLoading(false)
  //   }
  //
  //   checkUserRole()
  // }, [router, redirectTo])
  //
  // if (loading) {
  //   return <div>Carregando...</div>
  // }
  //
  // if (!userRole) {
  //   return fallback
  // }
  //
  // // Check role requirement
  // if (requiredRole) {
  //   const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  //   if (!allowedRoles.includes(userRole)) {
  //     if (redirectTo) {
  //       router.push(redirectTo)
  //       return null
  //     }
  //     return fallback
  //   }
  // }
  //
  // // Check permission requirement
  // if (requiredPermission && !hasPermission(userRole, requiredPermission as any)) {
  //   if (redirectTo) {
  //     router.push(redirectTo)
  //     return null
  //   }
  //   return fallback
  // }
  //
  // return <>{children}</>
}
