import { redirect } from "next/navigation"
import Link from "next/link"
import { PaymentForm } from "@/components/payments/payment-form"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db/postgres"

interface PaymentPageProps {
  params: Promise<{ id: string }>
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params

  const user = await getCurrentUser()
  if (!user || !user.company_id) redirect("/auth/login")

  const invoiceRows = await query(
    `SELECT i.*,
      json_build_object(
        'name', c.name,
        'cpf_cnpj', c.cpf_cnpj
      ) as client
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    WHERE i.id = $1 AND i.company_id = $2`,
    [id, user.company_id],
  )

  if (!invoiceRows || invoiceRows.length === 0) {
    redirect("/dashboard/invoices")
  }

  const invoice = invoiceRows[0]

  // Não permitir pagamento se já estiver paga
  if (invoice.status === "paid") {
    redirect(`/dashboard/invoices/${id}`)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <Link href="/dashboard/invoices" className="text-sm text-gray-600 hover:text-gray-900">
            Notas Fiscais
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <Link href={`/dashboard/invoices/${id}`} className="text-sm text-gray-600 hover:text-gray-900">
            NF-e {invoice.invoice_number}
          </Link>
          <span className="text-sm text-gray-400">/</span>
          <h1 className="text-lg font-semibold text-gray-900">Registrar Pagamento</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Registrar Pagamento</h2>
          <p className="text-gray-600 mt-1">
            Registre o pagamento da NF-e {invoice.invoice_number}
            {invoice.client && ` - ${invoice.client.name}`}
          </p>
        </div>

        <div className="max-w-2xl">
          <PaymentForm invoice={invoice} />
        </div>
      </main>
    </div>
  )
}
