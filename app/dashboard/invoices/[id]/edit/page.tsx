import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { InvoiceForm } from "@/components/invoices/invoice-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

interface EditInvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's company
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/auth/login")
  }

  // Get invoice data with items
  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (
        description,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single()

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  // Get clients for the company
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, document, document_type")
    .eq("company_id", profile.company_id)
    .order("name")

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
