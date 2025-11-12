import { redirect } from "next/navigation"
import { query } from "@/lib/db/postgres"
import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function NewInvoicePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profileResult = await query("SELECT company_id FROM profiles WHERE id = $1", [user.id])
  const profile = profileResult.rows[0]

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  const clientsResult = await query(
    "SELECT id, name, cpf_cnpj as document, 'cpf' as document_type FROM clients WHERE company_id = $1 ORDER BY name",
    [profile.company_id],
  )

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <Link href="/dashboard/invoices" className="text-sm text-muted-foreground hover:text-foreground">
            Notas Fiscais
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Nova Nota Fiscal</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nova Nota Fiscal</h2>
            <p className="text-muted-foreground">Crie uma nova nota fiscal manualmente</p>
          </div>
        </div>

        <div className="max-w-4xl">
          <InvoiceForm clients={clientsResult.rows || []} />
        </div>
      </main>
    </div>
  )
}
