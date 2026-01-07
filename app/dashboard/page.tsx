import { redirect } from "next/navigation"
import Link from "next/link"

import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { PaymentStatusChart } from "@/components/dashboard/payment-status-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { user } = await getSession()
  if (!user) redirect("/auth/login")

  const supabase = createAdminClient()

  const [
    profileResult,
    invoicesResult,
    clientsCountResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        company_id,
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
        id,
        invoice_number,
        total_amount,
        amount_paid,
        status,
        created_at,
        clients (
          name
        )
      `)
      .eq("company_id", user.company_id || "")
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("company_id", user.company_id || ""),
  ])

  const profile = profileResult.data
  const invoices = invoicesResult.data || []
  const clientsCount = clientsCountResult.count || 0

  // 🔒 Empresa obrigatória
  if (!profile?.company_id) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuração necessária</CardTitle>
            <CardDescription>
              Antes de continuar, você precisa configurar sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/settings">
                Configurar Empresa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* 🔹 HEADER PADRÃO */}
      <PageHeader
        title="Dashboard"
        description={`Visão geral da empresa ${profile.companies?.name ?? ""}`}
        actions={
          <Button asChild>
            <Link href="/invoices/new">
              Nova Nota Fiscal
            </Link>
          </Button>
        }
      />

      {/* 🔹 CONTEÚDO */}
      <div className="space-y-6">
        {/* Cards principais */}
        <DashboardStats
          invoices={invoices}
          clientsCount={clientsCount}
        />

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart invoices={invoices} />
          <PaymentStatusChart invoices={invoices} />
        </div>

        {/* Últimas notas */}
        <RecentInvoices invoices={invoices.slice(0, 5)} />
      </div>
    </>
  )
}
