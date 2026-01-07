import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { CreateInvoiceButton } from "@/components/invoices/create-invoice-button"
import { DashboardCharts } from "@/components/dashboard/charts-client"

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
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single(),

    supabase
      .from("invoices")
      .select("*")
      .eq("company_id", user.company_id!)
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.company_id!),
  ])

  const profile = profileResult.data
  const invoices = invoicesResult.data || []
  const clientsCount = clientsCountResult.count || 0

  // 🚨 Empresa obrigatória
  if (!profile?.company_id) {
    redirect("/dashboard/settings")
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
            <Link href="/dashboard/reports">Ver Relatórios</Link>
          </Button>
        </div>

        {/* Cards */}
        <DashboardStats invoices={invoices} clientsCount={clientsCount} />

        {/* 🔥 GRÁFICOS (CLIENT) */}
        <DashboardCharts invoices={invoices} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentInvoices invoices={invoices.slice(0, 5)} />

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard/clients/new">Cadastrar Novo Cliente</Link>
              </Button>

              {/* ✅ Agora funciona */}
              <CreateInvoiceButton />

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/import">Importar XML</Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/reports">Relatórios</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
