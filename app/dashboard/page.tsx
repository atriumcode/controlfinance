import { redirect } from "next/navigation"

import { createAdminClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  // 🔐 Sessão
  const { user } = await getSession()
  if (!user) redirect("/auth/login")

  const supabase = createAdminClient()

  // 🏢 Empresa
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) redirect("/dashboard/settings")

  // 📊 Faturamento
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_amount, amount_paid")
    .eq("company_id", profile.company_id)

  const total =
    invoices?.reduce(
      (sum, i) => sum + Number(i.total_amount || 0),
      0
    ) ?? 0

  const received =
    invoices?.reduce(
      (sum, i) => sum + Number(i.amount_paid || 0),
      0
    ) ?? 0

  const pending = total - received

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do faturamento"
        actions={
          <Button asChild>
            <Link href="/dashboard/invoices">
              Ver relatório detalhado
            </Link>
          </Button>
        }
      />

      {/* CARDS DE FATURAMENTO */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Faturamento Total
            </p>
            <p className="text-2xl font-bold">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Valor Recebido
            </p>
            <p className="text-2xl font-bold text-green-600">
              R$ {received.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Valor Pendente
            </p>
            <p className="text-2xl font-bold text-red-600">
              R$ {pending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
