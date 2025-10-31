import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import Link from "next/link"
import { ReportsContent } from "@/components/reports/reports-content"

export default async function ReportsPage() {
  const user = await getAuthenticatedUser()
  const supabase = createAdminClient()

  // Get user's company
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  const { data: company } = await supabase
    .from("companies")
    .select("name, cnpj, address, city, state, logo_url")
    .eq("id", profile.company_id)
    .single()

  // Get comprehensive data for reports
  const { data: invoices } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        name,
        document,
        document_type,
        city,
        state
      )
    `)
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  const { data: clients } = await supabase.from("clients").select("*").eq("company_id", profile.company_id)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div
        data-user-email={user.email}
        data-user-name={user.full_name || user.email}
        data-company-name={company?.name || "COPYCENTER LTDA"}
        data-company-cnpj={company?.cnpj || "N/A"}
        data-company-address={company?.address || ""}
        data-company-city={company?.city || ""}
        data-company-state={company?.state || ""}
        data-company-logo={company?.logo_url || ""}
        style={{ display: "none" }}
      />

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

        <ReportsContent initialInvoices={invoices || []} clients={clients || []} />
      </main>
    </div>
  )
}
