export type UserRole = "admin" | "user" | "viewer"

export const ROLES = {
  VIEWER: "viewer" as const,
  USER: "user" as const,
  ADMIN: "admin" as const,
}

export const ROLE_PERMISSIONS = {
  [ROLES.VIEWER]: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  [ROLES.USER]: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  [ROLES.ADMIN]: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canAccessAdmin: true,
  },
}

export function hasPermission(userRole: UserRole, permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) {
  return ROLE_PERMISSIONS[userRole][permission]
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Admin routes
  if (route.startsWith("/dashboard/admin") || route.startsWith("/dashboard/users")) {
    return hasPermission(userRole, "canManageUsers")
  }

  // Write operations (new, edit, delete)
  if (route.includes("/new") || route.includes("/edit") || route.includes("/delete")) {
    return hasPermission(userRole, "canWrite")
  }

  // All users can read
  return hasPermission(userRole, "canRead")
}

export function getRoleLabel(role: UserRole): string {
  const labels = {
    viewer: "Visualização",
    user: "Usuário",
    admin: "Administrador",
  }
  return labels[role]
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    viewer: "Apenas visualizar dados",
    user: "Visualizar e editar dados",
    admin: "Acesso completo ao sistema",
  }
  return descriptions[role]
}
