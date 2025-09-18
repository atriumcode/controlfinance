import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { MonthlyReport } from "@/components/reports/monthly-report"
import { ClientsReport } from "@/components/reports/clients-report"
import { PaymentMethodsReport } from "@/components/reports/payment-methods-report"

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's company
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", data.user.id).single()

  if (!profile?.company_id) {
    redirect("/auth/login")
  }

  // Get comprehensive data for reports
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        name,
        document,
        document_type
      )
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  const { data: clients } = await supabase.from("clients").select("*").eq("company_id", profile.company_id)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Relatórios</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
            <p className="text-muted-foreground">Análises detalhadas do seu negócio</p>
          </div>
        </div>

        <ReportsOverview invoices={invoices || []} clients={clients || []} />

        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyReport invoices={invoices || []} />
          <PaymentMethodsReport invoices={invoices || []} />
        </div>

        <ClientsReport invoices={invoices || []} clients={clients || []} />
      </main>
    </div>
  )
}
