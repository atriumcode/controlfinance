import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { InvoiceForm } from "@/components/invoices/invoice-form"

export const dynamic = "force-dynamic"

export default async function NewInvoicePage() {
  // 🔐 Sessão (MESMO padrão do dashboard)
  const { user } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  // 🏢 Verificar empresa vinculada
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("[NewInvoicePage] erro ao buscar profile:", error)
    redirect("/dashboard")
  }

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  // 👥 Clientes da empresa
  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("id, name, document, document_type")
    .eq("company_id", profile.company_id)
    .order("name")

  if (clientsError) {
    console.error("[NewInvoicePage] erro ao buscar clientes:", clientsError)
  }

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
