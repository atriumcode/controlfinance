import { redirect } from "next/navigation"
import { query } from "@/lib/db/postgres"
import { getSession } from "@/lib/auth/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { PaymentStatusChart } from "@/components/dashboard/payment-status-chart"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { user } = await getSession()

  if (!user) {
    redirect("/auth/login")
  }

  const profileRows = await query(
    `
    SELECT p.*, c.name as company_name, c.cnpj as company_cnpj
    FROM profiles p
    LEFT JOIN companies c ON p.company_id = c.id
    WHERE p.id = $1
  `,
    [user.id],
  )

  const profile = profileRows[0]

  if (!profile?.company_id) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Configuração Necessária</CardTitle>
            <CardDescription>Você precisa configurar sua empresa antes de continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
              <Link href="/dashboard/settings">Configurar Empresa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [invoicesRows, clientsCountRows] = await Promise.all([
    query(
      `
      SELECT i.*, cl.name as client_name, cl.cpf_cnpj as document,
             COALESCE(SUM(py.amount), 0) as amount_paid
      FROM invoices i
      LEFT JOIN clients cl ON i.client_id = cl.id
      LEFT JOIN payments py ON i.id = py.invoice_id
      WHERE i.company_id = $1
        AND i.created_at >= NOW() - INTERVAL '90 days'
      GROUP BY i.id, cl.name, cl.cpf_cnpj
      ORDER BY i.created_at DESC
      LIMIT 100
    `,
      [profile.company_id],
    ),
    query(
      `
      SELECT COUNT(*) as count
      FROM clients
      WHERE company_id = $1
    `,
      [profile.company_id],
    ),
  ])

  const invoices = invoicesRows || []
  const clientsCount = Number.parseInt(clientsCountRows[0]?.count || "0")

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Acompanhe o desempenho do seu negócio</p>
          </div>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
            <Link href="/dashboard/reports">Ver Relatórios</Link>
          </Button>
        </div>

        <DashboardStats invoices={invoices} clientsCount={clientsCount} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart invoices={invoices} />
          <PaymentStatusChart invoices={invoices} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInvoices invoices={invoices.slice(0, 5)} />

          <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Ações Rápidas</CardTitle>
              <CardDescription className="text-gray-600">Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm" size="sm">
                <Link href="/dashboard/clients/new">Cadastrar Novo Cliente</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
                size="sm"
              >
                <Link href="/dashboard/invoices/new">Criar Nova Nota Fiscal</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
                size="sm"
              >
                <Link href="/dashboard/import">Importar XML de NF-e</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 bg-transparent"
                size="sm"
              >
                <Link href="/dashboard/reports">Ver Relatórios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
