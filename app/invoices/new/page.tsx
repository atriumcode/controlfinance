import { createClient } from "@/lib/supabase/server"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function NewInvoicePage() {
  const supabase = await createClient()

  // 1️⃣ Usuário autenticado
  const user = await getAuthenticatedUser()
  if (!user) redirect("/auth/login")

  // 2️⃣ Buscar profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  // 3️⃣ Onboarding obrigatório
  if (!profile?.company_id) redirect("/dashboard/settings")

  // 4️⃣ Clientes da empresa
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, document, document_type")
    .eq("company_id", profile.company_id)
    .order("name")

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Nova Nota Fiscal</h1>
        <p className="text-muted-foreground">
          Crie uma nova nota fiscal manualmente
        </p>
      </div>

      <InvoiceForm clients={clients || []} />
    </div>
  )
}
