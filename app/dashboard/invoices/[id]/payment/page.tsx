import { redirect } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import { PaymentForm } from "@/components/payments/payment-form"
import { requireAuth } from "@/lib/auth/actions"

interface PaymentPageProps {
  params: { id: string }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = params

  // Auth padronizado (MESMO do dashboard)
  const user = await requireAuth()

  const supabase = createAdminClient()

  // Buscar company do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    redirect("/auth/login")
  }

  // Buscar NF-e
  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      `
      *,
      clients (
        name,
        document,
        document_type
      )
    `
    )
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single()

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
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrar Pagamento</h2>
          <p className="text-muted-foreground">
            Registre o pagamento da NF-e {invoice.invoice_number}
            {invoice.clients && ` - ${invoice.clients.name}`}
          </p>
        </div>

        <div className="max-w-2xl">
          <PaymentForm invoice={invoice} />
        </div>
      </main>
    </div>
  )
}
