import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCPF, formatCNPJ } from "@/lib/utils/document-validation"
import { Edit, ArrowLeft } from "lucide-react"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
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

  // Get client data with invoices
  const { data: client } = await supabase
    .from("clients")
    .select(`
      *,
      invoices (
        id,
        invoice_number,
        issue_date,
        total_amount,
        status
      )
    `)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single()

  if (!client) {
    redirect("/dashboard/clients")
  }

  const formatDocument = (document: string, type: "cpf" | "cnpj") => {
    return type === "cpf" ? formatCPF(document) : formatCNPJ(document)
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <Link href="/dashboard/clients" className="text-sm text-muted-foreground hover:text-foreground">
            Clientes
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">{client.name}</h1>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>Dados cadastrais do cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="text-lg font-medium">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Documento</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {client.document_type.toUpperCase()}
                      </Badge>
                      <p className="font-medium">{formatDocument(client.document, client.document_type)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{client.email || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p>{client.phone || "-"}</p>
                  </div>
                </div>

                {(client.address || client.city || client.state || client.zip_code) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                    <div className="space-y-1">
                      {client.address && <p>{client.address}</p>}
                      {(client.city || client.state) && (
                        <p>
                          {client.city}
                          {client.city && client.state && ", "}
                          {client.state}
                        </p>
                      )}
                      {client.zip_code && <p>CEP: {client.zip_code}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Notas Fiscais</CardTitle>
                <CardDescription>
                  {client.invoices?.length || 0} nota{client.invoices?.length !== 1 ? "s" : ""} fiscal
                  {client.invoices?.length !== 1 ? "is" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!client.invoices || client.invoices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma nota fiscal encontrada</p>
                ) : (
                  <div className="space-y-4">
                    {client.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">NF-e {invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">Emitida em {formatDate(invoice.issue_date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                          <Badge variant={invoice.status === "paid" ? "default" : "outline"} className="text-xs">
                            {invoice.status === "paid" ? "Pago" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de NF-e</span>
                  <span className="font-medium">{client.invoices?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Total</span>
                  <span className="font-medium">
                    {formatCurrency(client.invoices?.reduce((sum: number, inv: any) => sum + inv.total_amount, 0) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente desde</span>
                  <span className="font-medium">{formatDate(client.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
