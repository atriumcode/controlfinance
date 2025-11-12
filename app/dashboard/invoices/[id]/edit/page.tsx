import { redirect } from "next/navigation"
import { query } from "@/lib/db/postgres"
import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

interface EditInvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profileResult = await query("SELECT company_id FROM profiles WHERE id = $1", [user.id])
  const profile = profileResult.rows[0]

  if (!profile?.company_id) {
    redirect("/auth/login")
  }

  const invoiceResult = await query(
    `SELECT i.*,
      json_agg(
        json_build_object(
          'description', ii.description,
          'quantity', ii.quantity,
          'unit_price', ii.unit_price,
          'total_price', ii.total_price
        )
      ) FILTER (WHERE ii.id IS NOT NULL) as invoice_items
    FROM invoices i
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.id = $1 AND i.company_id = $2
    GROUP BY i.id`,
    [id, profile.company_id],
  )
  const invoice = invoiceResult.rows[0]

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  const clientsResult = await query(
    "SELECT id, name, cpf_cnpj as document, 'cpf' as document_type FROM clients WHERE company_id = $1 ORDER BY name",
    [profile.company_id],
  )
  const clients = clientsResult.rows

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
          <Link href={`/dashboard/invoices/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
            NF-e {invoice.invoice_number}
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Editar</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Editar Nota Fiscal</h2>
            <p className="text-muted-foreground">Atualize as informações da NF-e {invoice.invoice_number}</p>
          </div>
        </div>

        <div className="max-w-4xl">
          <InvoiceForm clients={clients || []} invoice={invoice} />
        </div>
      </main>
    </div>
  )
}
