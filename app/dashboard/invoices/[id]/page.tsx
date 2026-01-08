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
        document_type,
        city,
        state
      ),
      payments (
        id,
        amount,
        payment_date,
        method
      )
    `)
    .eq("id", params.id)
    .eq("company_id", user.company_id)
    .single()

  if (!invoice) redirect("/dashboard/invoices")

  const total = Number(invoice.total_amount || 0)
  const paid =
    invoice.payments?.reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    ) ?? Number(invoice.amount_paid || 0)

  const pending = total - paid

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
            <span>
              {invoice.clients?.name} —{" "}
              {invoice.clients?.city}/{invoice.clients?.state}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total</span>
            <span>
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Pago</span>
            <span>
              R$ {paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between font-semibold">
            <span>Pendente</span>
            <span>
              R$ {pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </CardContent>
      </Card>

      {invoice.payments?.length > 0 && (
        <Card className="mt-6">
          <CardContent className="pt-6 space-y-2">
            <h3 className="font-semibold">Pagamentos</h3>

            {invoice.payments.map((p: any) => (
              <div
                key={p.id}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>
                  {new Date(p.payment_date).toLocaleDateString("pt-BR")} —{" "}
                  {p.method}
                </span>
                <span>
                  R$ {Number(p.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </>
  )
}
