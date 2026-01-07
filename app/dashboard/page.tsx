import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
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

  const supabase = createAdminClient()

  const [
  profileResult,
  invoicesResult,
  clientsCountResult,
  paymentsResult,
] = await Promise.all([
  supabase
    .from("profiles")
    .select(`
      *,
      companies (
        name,
        cnpj
      )
    `)
    .eq("id", user.id)
    .single(),

  supabase
    .from("invoices")
    .select(`
      *,
      amount_paid,
      clients (
        name,
        document,
        document_type
      )
    `)
    .eq("company_id", user.company_id || "")
    .gte(
      "created_at",
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at", { ascending: false })
    .limit(100),

  supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("company_id", user.company_id || ""),

])

  const profile = profileResult.data
  const invoices = invoicesResult.data
  const clientsCount = clientsCountResult.count

  if (!profile?.company_id) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração Necessária</CardTitle>
            <CardDescription>Você precisa configurar sua empresa antes de continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/settings">Configurar Empresa</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">Visão geral do seu negócio</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/reports">Ver Relatórios Detalhados</Link>
          </Button>
        </div>

        <DashboardStats invoices={invoices || []} clientsCount={clientsCount || 0} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart invoices={invoices || []} />
          <PaymentStatusChart invoices={invoices || []} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInvoices invoices={invoices?.slice(0, 5) || []} />

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/clients/new">Cadastrar Novo Cliente</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/invoices/new">Criar Nova Nota Fiscal</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/import">Importar XML de NF-e</Link>
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/reports">Ver Relatórios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
