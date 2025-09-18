import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { PaymentStatusChart } from "@/components/dashboard/payment-status-chart"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  console.log("[v0] Dashboard - checking user authentication")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log("[v0] Dashboard - no user found, redirecting to login", { error: error?.message })
    redirect("/auth/login")
  }

  console.log("[v0] Dashboard - user authenticated:", data.user.id)

  // Get user profile and company info
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      companies (
        name,
        cnpj
      )
    `)
    .eq("id", data.user.id)
    .single()

  console.log("[v0] Dashboard - profile data:", { hasProfile: !!profile, hasCompany: !!profile?.company_id })

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

  // Get all invoices for analytics
  const { data: invoices } = await supabase
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
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  // Get clients count
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("company_id", profile.company_id)

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
                <Link href="/dashboard/invoices/new">Criar Nova Nota Fiscal</Link>
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
