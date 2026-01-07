import { redirect } from "next/navigation"
import Link from "next/link"

import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Props {
  params: { id: string }
}

export default async function InvoiceDetailsPage({ params }: Props) {
  const { user } = await getSession()
  if (!user) redirect("/auth/login")

  const supabase = createAdminClient()

  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        name,
        document,
        document_type
      )
    `)
    .eq("id", params.id)
    .eq("company_id", user.company_id)
    .single()

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  return (
    <>
      <PageHeader
        title={`NF-e ${invoice.invoice_number}`}
        description="Detalhes da nota fiscal"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/invoices/${invoice.id}/payment`}>
                Registrar Pagamento
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="mt-6">
        <CardContent className="grid gap-4 pt-6">
          <div className="flex justify-between">
            <span>Status</span>
            <Badge>{invoice.status}</Badge>
          </div>

          <div className="flex justify-between">
            <span>Cliente</span>
            <span>{invoice.clients?.name}</span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span>
              R$ {Number(invoice.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Pago</span>
            <span>
              R$ {Number(invoice.amount_paid || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
