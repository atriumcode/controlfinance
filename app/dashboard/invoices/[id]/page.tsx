import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, CreditCard, FileText, Download } from "lucide-react"
import { formatCPF, formatCNPJ } from "@/lib/utils/document-validation"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
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

  // Get invoice data with client and items
  const { data: invoice } = await supabase
    .from("invoices")
    .select(`
      *,
      clients (
        name,
        document,
        document_type,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      ),
      invoice_items (
        description,
        quantity,
        unit_price,
        total_price,
        tax_rate
      )
    `)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single()

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", id)
    .order("payment_date", { ascending: false })

  if (!invoice) {
    redirect("/dashboard/invoices")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatDocument = (document: string, type: "cpf" | "cnpj") => {
    return type === "cpf" ? formatCPF(document) : formatCNPJ(document)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "Parcial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "overdue":
        return "Vencido"
      case "cancelled":
        return "Cancelado"
      case "Parcial":
        return "Parcial"
      default:
        return status
    }
  }

  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status === "pending"

  console.log("[v0] Invoice status:", invoice?.status)
  console.log("[v0] Invoice amount_paid:", invoice?.amount_paid)
  console.log(
    "[v0] Should show payment button:",
    invoice?.status === "pending" || invoice?.status === "Parcial" || invoice?.status === "overdue",
  )

  const shouldShowPaymentButton =
    invoice?.status === "pending" ||
    invoice?.status === "Parcial" ||
    invoice?.status === "overdue" ||
    (invoice?.amount_paid > 0 && invoice?.amount_paid < invoice?.total_amount)

  console.log("[v0] Invoice ID:", id)
  console.log("[v0] Invoice items count:", invoice?.invoice_items?.length || 0)
  console.log("[v0] Invoice items:", invoice?.invoice_items)

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
          <h1 className="text-lg font-semibold">NF-e {invoice.invoice_number}</h1>
        </nav>
        <div className="flex items-center gap-2">
          {shouldShowPaymentButton && (
            <Button asChild>
              <Link href={`/dashboard/invoices/${invoice.id}/payment`}>
                <CreditCard className="h-4 w-4 mr-2" />
                Registrar Pagamento
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          {invoice.xml_content && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              XML
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/invoices">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Nota Fiscal {invoice.invoice_number}
                    </CardTitle>
                    <CardDescription>
                      {invoice.nfe_key && <span className="text-xs font-mono">Chave NF-e: {invoice.nfe_key}</span>}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Emissão</label>
                    <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                      <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                        {formatDate(invoice.due_date)}
                        {isOverdue && <span className="text-xs ml-2">(Vencido)</span>}
                      </p>
                    </div>
                  )}
                  {invoice.payment_date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data do Pagamento</label>
                      <p className="font-medium text-green-600">{formatDate(invoice.payment_date)}</p>
                    </div>
                  )}
                  {invoice.payment_method && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Método de Pagamento</label>
                      <p className="font-medium">{invoice.payment_method}</p>
                    </div>
                  )}
                </div>

                {invoice.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Observações</label>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {invoice.clients && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="font-medium">{invoice.clients.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Documento</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {invoice.clients.document_type.toUpperCase()}
                        </Badge>
                        <p className="font-medium">
                          {formatDocument(invoice.clients.document, invoice.clients.document_type)}
                        </p>
                      </div>
                    </div>
                    {invoice.clients.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p>{invoice.clients.email}</p>
                      </div>
                    )}
                    {invoice.clients.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <p>{invoice.clients.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Itens da Nota Fiscal</CardTitle>
              </CardHeader>
              <CardContent>
                {!invoice.invoice_items || invoice.invoice_items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum item encontrado nesta nota fiscal.</p>
                ) : (
                  <div className="space-y-4">
                    {invoice.invoice_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} × {formatCurrency(item.unit_price)}
                            {item.tax_rate > 0 && <span className="ml-2">({item.tax_rate}% imposto)</span>}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {payments && payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.map((payment: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.payment_date)} • {payment.payment_method}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Pago
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(invoice.total_amount - invoice.tax_amount + invoice.discount_amount)}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Impostos</span>
                      <span>{formatCurrency(invoice.tax_amount)}</span>
                    </div>
                  )}
                  {invoice.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                  {invoice.amount_paid > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span className="text-muted-foreground">Valor Pago</span>
                        <span className="font-medium">{formatCurrency(invoice.amount_paid)}</span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span className="text-muted-foreground">Saldo Restante</span>
                        <span className="font-medium">
                          {formatCurrency(invoice.total_amount - invoice.amount_paid)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Líquido</span>
                    <span className="font-medium">{formatCurrency(invoice.net_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Nota Fiscal
                  </Link>
                </Button>
                {shouldShowPaymentButton && (
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/invoices/${invoice.id}/payment`}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Registrar Pagamento
                    </Link>
                  </Button>
                )}
                {invoice.xml_content && (
                  <Button variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar XML
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
