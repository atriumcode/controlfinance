import { redirect } from "next/navigation"
import { query } from "@/lib/db/postgres"
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

  const user = await getAuthenticatedUser()
  if (!user) redirect("/auth/login")

  const profileRows = await query("SELECT company_id FROM profiles WHERE id = $1", [user.id])
  const profile = profileRows?.[0] || null
  if (!profile?.company_id) redirect("/auth/login")

  // Busca invoice + client + items
  const invoiceRows = await query(
    `SELECT i.*,
      json_build_object(
        'name', c.name,
        'document', c.cpf_cnpj,
        'document_type', CASE 
          WHEN LENGTH(REPLACE(REPLACE(c.cpf_cnpj, '.', ''), '-', '')) = 11 THEN 'cpf'
          ELSE 'cnpj'
        END,
        'email', c.email,
        'phone', c.phone,
        'address', c.address,
        'city', c.city,
        'state', c.state,
        'zip_code', c.zip_code
      ) as client,
      json_agg(
        json_build_object(
          'description', ii.description,
          'quantity', ii.quantity,
          'unit_price', ii.unit_price,
          'total_price', ii.total_price
        )
      ) FILTER (WHERE ii.id IS NOT NULL) as invoice_items
    FROM invoices i
    LEFT JOIN clients c ON c.id = i.client_id
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.id = $1 AND i.company_id = $2
    GROUP BY i.id, c.id`,
    [id, profile.company_id],
  )

  const invoice = invoiceRows?.[0] || null
  if (!invoice) redirect("/dashboard/invoices")

  // Pagamentos
  const payments = await query(
    "SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC",
    [id],
  )

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR")

  const formatDocument = (doc: string, type: "cpf" | "cnpj") =>
    type === "cpf" ? formatCPF(doc) : formatCNPJ(doc)

  const isOverdue =
    invoice?.due_date &&
    new Date(invoice.due_date) < new Date() &&
    invoice?.status === "pending"

  const shouldShowPaymentButton =
    invoice?.status === "pending" ||
    invoice?.status === "partial" ||
    invoice?.status === "overdue" ||
    (Number(invoice?.paid_amount || 0) > 0 &&
      Number(invoice?.paid_amount) < Number(invoice?.total_amount))

  const statusColor = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
    partial: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-800",
  }[invoice.status] || "bg-gray-100 text-gray-800"

  const statusLabel = {
    paid: "Pago",
    pending: "Pendente",
    overdue: "Vencido",
    partial: "Parcial",
    cancelled: "Cancelado",
  }[invoice.status] || invoice.status

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

          {invoice.xml_file_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={invoice.xml_file_url} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" />
                XML
              </a>
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

          {/* COLUNA ESQUERDA */}
          <div className="lg:col-span-2 space-y-6">

            {/* DADOS DA NF */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Nota Fiscal {invoice.invoice_number}
                    </CardTitle>
                    {invoice.nfe_key && (
                      <CardDescription className="font-mono text-xs">
                        Chave NF-e: {invoice.nfe_key}
                      </CardDescription>
                    )}
                  </div>

                  <Badge className={statusColor}>{statusLabel}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Data de Emissão</label>
                    <p className="font-medium">{formatDate(invoice.issue_date)}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Data de Vencimento</label>
                    <p className={`font-medium ${isOverdue ? "text-red-600" : ""}`}>
                      {formatDate(invoice.due_date)}
                      {isOverdue && <span className="text-xs ml-2">(Vencido)</span>}
                    </p>
                  </div>

                  {invoice.payment_date && (
                    <div>
                      <label className="text-sm text-muted-foreground">Data do Pagamento</label>
                      <p className="font-medium text-green-600">{formatDate(invoice.payment_date)}</p>
                    </div>
                  )}

                  {invoice.payment_method && (
                    <div>
                      <label className="text-sm text-muted-foreground">Método de Pagamento</label>
                      <p className="font-medium">{invoice.payment_method}</p>
                    </div>
                  )}
                </div>

                {invoice.notes && (
                  <div>
                    <label className="text-sm text-muted-foreground">Observações</label>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CLIENTE */}
            {invoice.client && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Cliente</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm text-muted-foreground">Nome</label>
                      <p className="font-medium">{invoice.client.name}</p>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">Documento</label>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {invoice.client.document_type?.toUpperCase()}
                        </Badge>
                        <p className="font-medium">
                          {formatDocument(invoice.client.document, invoice.client.document_type)}
                        </p>
                      </div>
                    </div>

                    {invoice.client.email && (
                      <div>
                        <label className="text-sm text-muted-foreground">Email</label>
                        <p>{invoice.client.email}</p>
                      </div>
                    )}

                    {invoice.client.phone && (
                      <div>
                        <label className="text-sm text-muted-foreground">Telefone</label>
                        <p>{invoice.client.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ITENS */}
            <Card>
              <CardHeader>
                <CardTitle>Itens da Nota Fiscal</CardTitle>
              </CardHeader>

              <CardContent>
                {!invoice.invoice_items || invoice.invoice_items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum item encontrado.</p>
                ) : (
                  <div className="space-y-4">
                    {invoice.invoice_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Qtd: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PAGAMENTOS */}
            {payments && payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {payments.map((payment: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{formatCurrency(Number(payment.amount))}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(payment.payment_date)} • {payment.payment_method}
                        </p>
                      </div>

                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Pago
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(invoice.total_amount || 0))}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(Number(invoice.total_amount || 0))}</span>
                  </div>

                  {Number(invoice.paid_amount || 0) > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span className="text-muted-foreground">Valor Pago</span>
                        <span className="font-medium">
                          {formatCurrency(Number(invoice.paid_amount))}
                        </span>
                      </div>

                      <div className="flex justify-between text-orange-600">
                        <span className="text-muted-foreground">Saldo Restante</span>
                        <span className="font-medium">
                          {formatCurrency(
                            Number(invoice.total_amount) - Number(invoice.paid_amount),
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Líquido</span>
                    <span className="font-medium">
                      {formatCurrency(Number(invoice.total_amount || 0))}
                    </span>
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

                {invoice.xml_file_url && (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <a href={invoice.xml_file_url} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar XML
                    </a>
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
