import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

import { PageHeader } from "@/components/layout/page-header"
import { PaymentForm } from "@/components/payments/payment-form"

interface Props {
  params: { id: string }
}

export default async function InvoicePaymentPage({ params }: Props) {
  const { user } = await getSession()
  if (!user) redirect("/auth/login")

  const supabase = createAdminClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.id)
    .eq("company_id", user.company_id)
    .single()

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  return (
    <>
      <PageHeader
        title="Registrar Pagamento"
        description={`NF-e ${invoice.invoice_number}`}
      />

      <div className="mt-6 max-w-2xl">
        <PaymentForm invoice={invoice} />
      </div>
    </>
  )
}
