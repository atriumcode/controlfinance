import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { redirect } from 'next/navigation'
import { queryMany, queryOne } from "@/lib/db/postgres"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function PaymentsPage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/auth/login")
  }

  const profile = await queryOne<{ company_id: string }>("SELECT company_id FROM profiles WHERE id = $1", [user.id])

  if (!profile?.company_id) {
    redirect("/dashboard/settings?setup=true")
  }

  // Get payments with invoice and client data
  const payments = await queryMany(
    `
    SELECT 
      p.*,
      i.invoice_number,
      c.name as client_name
    FROM payments p
    LEFT JOIN invoices i ON p.invoice_id = i.id
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.company_id = $1
    ORDER BY p.payment_date DESC
  `,
    [profile.company_id],
  )

  const invoices = await queryMany("SELECT * FROM invoices WHERE company_id = $1", [profile.company_id])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const totalReceived =
    payments
      ?.filter((p: any) => new Date(p.payment_date) >= startOfMonth)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0

  const pendingInvoices = invoices?.filter(
    (inv: any) =>
      inv.status === "pending" ||
      inv.status === "Pendente" ||
      inv.status === "pendente" ||
      inv.status === "partial" ||
      inv.status === "Parcial" ||
      inv.status === "parcial",
  )

  const totalPending =
    pendingInvoices?.reduce((sum: number, inv: any) => {
      const remaining = Number(inv.total_amount) - Number(inv.amount_paid || 0)
      return sum + remaining
    }, 0) || 0

  const totalOverdue =
    invoices
      ?.filter(
        (inv: any) =>
          (inv.status === "pending" ||
            inv.status === "Pendente" ||
            inv.status === "pendente" ||
            inv.status === "partial" ||
            inv.status === "Parcial" ||
            inv.status === "parcial") &&
          inv.due_date &&
          new Date(inv.due_date) < now,
      )
      .reduce((sum: number, inv: any) => sum + (Number(inv.total_amount) - Number(inv.amount_paid || 0)), 0) || 0

  const last7Days =
    payments
      ?.filter((p: any) => new Date(p.payment_date) >= sevenDaysAgo)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Pagamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie pagamentos e histórico financeiro</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
          <Link href="/dashboard/invoices">Ver Notas Fiscais</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceived)}</div>
            <p className="text-xs text-gray-500 mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">A Receber</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-gray-500 mt-1">Pendente</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
            <p className="text-xs text-gray-500 mt-1">Em atraso</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Últimos 7 dias</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(last7Days)}</div>
            <p className="text-xs text-gray-500 mt-1">Recebimentos</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</CardTitle>
          <CardDescription className="text-gray-600">Últimos pagamentos registrados no sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {!payments || payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>Nenhum pagamento registrado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{payment.client_name || "Cliente não identificado"}</p>
                    <p className="text-sm text-muted-foreground">
                      NF-e {payment.invoice_number || "N/A"} • {formatDate(payment.payment_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.payment_method}
                      {payment.notes && ` • ${payment.notes}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(Number(payment.amount))}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Recebido
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
