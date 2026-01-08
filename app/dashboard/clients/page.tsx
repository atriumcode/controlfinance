import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth/actions"
import ClientsClientPage from "./clients-client-page"

export default async function ClientsPage() {
  const user = await requireAuth()

  if (!user.company_id) {
    redirect("/dashboard/settings")
  }

  return (
    <ClientsClientPage companyId={user.company_id} />
  )
}
