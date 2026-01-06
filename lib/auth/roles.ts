export type UserRole =
  | "admin"
  | "manager"
  | "accountant"
  | "user"
  | "viewer"

export const ROLES = {
  USER: "user" as const,
  ACCOUNTANT: "accountant" as const,
  MANAGER: "manager" as const,
  ADMIN: "admin" as const,
  VIEWER: "viewer" as const,
}

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canAccessAdmin: false,
    canManageCompany: false,
    canViewReports: true,
  },
  [ROLES.ACCOUNTANT]: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: false,
    canAccessAdmin: false,
    canManageCompany: false,
    canViewReports: true,
  },
  [ROLES.MANAGER]: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canAccessAdmin: false,
    canManageCompany: true,
    canViewReports: true,
  },
  [ROLES.ADMIN]: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canAccessAdmin: true,
    canManageCompany: true,
    canViewReports: true,
  },
  [ROLES.VIEWER]: {
  canRead: true,
  canWrite: false,
  canDelete: false,
  canManageUsers: false,
  canAccessAdmin: false,
  canManageCompany: false,
  canViewReports: false,
},
}

export function hasPermission(userRole: UserRole, permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) {
  return ROLE_PERMISSIONS[userRole][permission]
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Admin routes
  if (route.startsWith("/dashboard/admin") || route.startsWith("/dashboard/users")) {
    return hasPermission(userRole, "canAccessAdmin")
  }

  // Company management routes
  if (route.startsWith("/dashboard/company")) {
    return hasPermission(userRole, "canManageCompany")
  }

  // User management routes
  if (route.startsWith("/dashboard/team")) {
    return hasPermission(userRole, "canManageUsers")
  }

  // Write operations (new, edit, delete)
  if (route.includes("/new") || route.includes("/edit")) {
    return hasPermission(userRole, "canWrite")
  }

  if (route.includes("/delete")) {
    return hasPermission(userRole, "canDelete")
  }

  // Reports
  if (route.startsWith("/dashboard/reports")) {
    return hasPermission(userRole, "canViewReports")
  }

  // All users can read basic dashboard content
  return hasPermission(userRole, "canRead")
}

export function getRoleLabel(role: UserRole): string {
  const labels = {
    user: "Usuário",
    accountant: "Contador",
    manager: "Gerente",
    admin: "Administrador",
  }
return labels[role] ?? "Desconhecido"
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    user: "Acesso básico para visualizar e criar registros",
    accountant: "Acesso completo aos dados financeiros e contábeis",
    manager: "Gerenciar equipe e configurações da empresa",
    admin: "Acesso completo ao sistema e configurações",
  }
return descriptions[role] ?? "Nível de acesso não definido"
}

export function getRoleHierarchy(): UserRole[] {
return [
  ROLES.VIEWER,
  ROLES.USER,
  ROLES.ACCOUNTANT,
  ROLES.MANAGER,
  ROLES.ADMIN,
]
}

export function isRoleHigherOrEqual(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = getRoleHierarchy()
  const userIndex = hierarchy.indexOf(userRole)
  const requiredIndex = hierarchy.indexOf(requiredRole)
  return userIndex >= requiredIndex
}
