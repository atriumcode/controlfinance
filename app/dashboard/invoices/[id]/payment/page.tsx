import { redirect } from "next/navigation"
import Link from "next/link"
import { PaymentForm } from "@/components/payments/payment-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { query } from "@/lib/db/postgres"

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
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
      json_build_object(
        'name', c.name,
        'document', c.cpf_cnpj,
        'document_type', 'cpf'
      ) as clients
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    WHERE i.id = $1 AND i.company_id = $2`,
    [id, profile.company_id],
  )
  const invoice = invoiceResult.rows[0]

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  if (invoice.status === "paid") {
    redirect(`/dashboard/invoices/${id}`)
  }

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
          <h1 className="text-lg font-semibold">Registrar Pagamento</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Registrar Pagamento</h2>
            <p className="text-muted-foreground">
              Registre o pagamento da NF-e {invoice.invoice_number}
              {invoice.clients && ` - ${invoice.clients.name}`}
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <PaymentForm invoice={invoice} />
        </div>
      </main>
    </div>
  )
}
