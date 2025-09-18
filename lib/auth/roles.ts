export type UserRole = "leitura" | "escrita" | "administrador"

export const ROLES = {
  LEITURA: "leitura" as const,
  ESCRITA: "escrita" as const,
  ADMINISTRADOR: "administrador" as const,
}

export const ROLE_PERMISSIONS = {
  [ROLES.LEITURA]: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  [ROLES.ESCRITA]: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canAccessAdmin: false,
  },
  [ROLES.ADMINISTRADOR]: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canAccessAdmin: true,
  },
}

export function hasPermission(userRole: UserRole, permission: keyof (typeof ROLE_PERMISSIONS)[UserRole]) {
  return true
  // Original code commented out:
  // return ROLE_PERMISSIONS[userRole][permission]
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  return true
  // Original code commented out:
  // // Admin routes
  // if (route.startsWith("/dashboard/admin") || route.startsWith("/dashboard/users")) {
  //   return hasPermission(userRole, "canManageUsers")
  // }
  //
  // // Write operations (new, edit, delete)
  // if (route.includes("/new") || route.includes("/edit") || route.includes("/delete")) {
  //   return hasPermission(userRole, "canWrite")
  // }
  //
  // // All users can read
  // return hasPermission(userRole, "canRead")
}

export function getRoleLabel(role: UserRole): string {
  const labels = {
    leitura: "Leitura",
    escrita: "Escrita",
    administrador: "Administrador",
  }
  return labels[role]
}

export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    leitura: "Apenas visualizar dados",
    escrita: "Visualizar e editar dados",
    administrador: "Acesso completo ao sistema",
  }
  return descriptions[role]
}
