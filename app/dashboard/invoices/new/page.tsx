import { createClient } from "@/lib/supabase/server"
import { InvoiceForm } from "@/components/invoices/invoice-form"

export default async function NewInvoicePage() {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .single()

  if (!profile?.company_id) {
    throw new Error("Empresa não vinculada ao usuário")
  }

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
