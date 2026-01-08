import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function requireAuthSafe() {
  const user = await getAuthenticatedUser()
  return user // retorna null se não autenticado
}
