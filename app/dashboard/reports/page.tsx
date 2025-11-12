import { redirect } from "next/navigation"
import { queryOne, queryMany } from "@/lib/db/helpers"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import Link from "next/link"
import { ReportsContent } from "@/components/reports/reports-content"

export default async function ReportsPage() {
  const user = await getAuthenticatedUser()

  const profile = await queryOne<{ company_id: string }>("SELECT company_id FROM profiles WHERE id = $1", [user.id])

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  const company = await queryOne(
    "SELECT name, cnpj, address, city, state, zip_code, phone, logo_url FROM companies WHERE id = $1",
    [profile.company_id],
  )

  // Get comprehensive data for reports with client info
  const invoices = await queryMany(
    `
    SELECT 
      i.*,
      json_build_object(
        'name', c.name,
        'document', c.cpf_cnpj,
        'document_type', CASE 
          WHEN LENGTH(REPLACE(REPLACE(c.cpf_cnpj, '.', ''), '-', '')) = 11 THEN 'CPF'
          ELSE 'CNPJ'
        END,
        'city', c.city,
        'state', c.state
      ) as clients
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.company_id = $1
    ORDER BY i.created_at DESC
  `,
    [profile.company_id],
  )

  const clients = await queryMany("SELECT * FROM clients WHERE company_id = $1", [profile.company_id])

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
        data-company-zip-code={company?.zip_code || ""}
        data-company-phone={company?.phone || ""}
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
