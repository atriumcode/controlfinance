import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

import { PageHeader } from "@/components/layout/page-header"
import { InvoiceForm } from "@/components/invoices/invoice-form"

interface Props {
  params: { id: string }
}

export default async function EditInvoicePage({ params }: Props) {
  const { user } = await getSession()
  if (!user) redirect("/auth/login")

  const supabase = createAdminClient()

  const [{ data: invoice }, { data: clients }] = await Promise.all([
    supabase
      .from("invoices")
      .select("*")
      .eq("id", params.id)
      .eq("company_id", user.company_id)
      .single(),

    supabase
      .from("clients")
      .select("id, name, document, document_type")
      .eq("company_id", user.company_id)
      .order("name"),
  ])

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  return (
    <>
      <PageHeader
        title="Editar Nota Fiscal"
        description={`NF-e ${invoice.invoice_number}`}
      />

      <div className="mt-6 max-w-4xl">
        <InvoiceForm invoice={invoice} clients={clients || []} />
      </div>
    </>
  )
}
