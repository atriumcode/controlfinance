import { redirect } from 'next/navigation'
import { queryOne, queryMany } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { ReportsContent } from "@/components/reports/reports-content"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Análises detalhadas do seu negócio</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
          <Link href="/dashboard">Voltar ao Dashboard</Link>
        </Button>
      </div>

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

      <ReportsContent initialInvoices={invoices || []} clients={clients || []} />
    </div>
  )
}
