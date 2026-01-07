import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "./server-auth"

export async function requireAuth() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}
