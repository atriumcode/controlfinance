import { redirect } from "next/navigation"
import { requireAuth } from "./require-auth"

export async function requireCompany() {
  const user = await requireAuth()

  if (!user.company_id) {
    redirect("/onboarding")
  }

  return user
}
