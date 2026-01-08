import { requireAuth } from "@/lib/auth/actions"
import { redirect } from "next/navigation"
import InvoicesClientPage from "./invoices-client-page"

export default async function InvoicesPage() {
  const user = await requireAuth()

  if (!user.company_id) {
    redirect("/dashboard/settings")
  }

  return (
    <InvoicesClientPage companyId={user.company_id} />
  )
}
