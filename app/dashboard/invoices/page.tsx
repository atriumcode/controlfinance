"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, FileText, MapPin, CreditCard, Trash2 } from "lucide-react"
import Link from "next/link"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteInvoice } from "@/lib/actions/invoice-actions"
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number | string | null
  amount_paid: number | string | null
  status: string
  issue_date: string
  due_date: string
  clients: {
    name: string
    document: string
    document_type: string
    city: string
    state: string
  } | null
}

interface ClientGroup {
  client: {
    name: string
    document: string
    document_type: string
    city: string
    state: string
  }
  invoices: Invoice[]
  totalInvoices: number
  totalAmount: number
  totalPaid: number
  totalPending: number
}

interface CityGroup {
  city: string
  state: string
  clientGroups: ClientGroup[]
  totalInvoices: number
  totalAmount: number
  totalPaid: number
  totalPending: number
}

/** Blindagem contra NaN, null e undefined */
const getNumber = (value: any): number => {
  const n = Number(value)
  return isNaN(n) ? 0 : n
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ id: string; number: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const supabase = createClient()

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile")

      if (!response.ok) {
        router.push("/auth/login")
        return
      }

      const profileData = await response.json()

      if (!profileData.company_id) {
        router.push("/auth/login")
        return
      }

      const { data: invoicesData, error: invoicesError } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        total_amount,
        amount_paid,
        status,
        issue_date,
        due_date,
        client_id,
        clients (
          name,
          document,
          document_type,
          city,
          state
        )
      `)
      .eq("company_id", profileData.company_id)
      .order("created_at", { ascending: false })
      .limit(200)


      if (invoicesError) {
        console.error("[v0] Error fetching invoices:", invoicesError)
        setInvoices([])
        setLoading(false)
        return
      }

      const clientIds = [...new Set(invoicesData?.map((inv) => inv.client_id).filter(Boolean))]

      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, name, document, document_type, city, state")
        .in("id", clientIds)

      if (clientsError) {
        console.error("[v0] Error fetching clients:", clientsError)
      }

      const clientsMap = new Map(clientsData?.map((client) => [client.id, client]) || [])

      const invoicesWithClients = invoicesData?.map((invoice) => ({
        ...invoice,
        clients: invoice.client_id ? clientsMap.get(invoice.client_id) || null : null,
      }))

      console.log("[v0] Total invoices fetched:", invoicesWithClients?.length)
      console.log("[v0] Total clients fetched:", clientsData?.length)
      console.log("[v0] Invoices with client data:", invoicesWithClients?.filter((inv) => inv.clients).length)
      console.log("[v0] Invoices without client data:", invoicesWithClients?.filter((inv) => !inv.clients).length)

      setInvoices(invoicesWithClients || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const cityGroups: CityGroup[] = invoices.reduce((groups: CityGroup[], invoice) => {
    const total = getNumber(invoice.total_amount)
    const paid = getNumber(invoice.amount_paid)
    const pending = total - paid

    const hasClient = invoice.clients && invoice.clients.city && invoice.clients.state

    const cityKey = hasClient ? `${invoice.clients.city}, ${invoice.clients.state}` : "Cidade não informada"

    let cityGroup = groups.find((g) => `${g.city}, ${g.state}` === cityKey)

    if (!cityGroup) {
      cityGroup = {
        city: hasClient ? invoice.clients.city : "Cidade não informada",
        state: hasClient ? invoice.clients.state : "",
        clientGroups: [],
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      }
      groups.push(cityGroup)
    }

    const clientKey = hasClient ? invoice.clients.document : "unknown-client"

    let clientGroup = cityGroup.clientGroups.find((g) => g.client.document === clientKey)

    if (!clientGroup) {
      clientGroup = {
        client: hasClient
          ? invoice.clients
          : {
              name: "Cliente não identificado",
              document: "N/A",
              document_type: "N/A",
              city: "N/A",
              state: "N/A",
            },
        invoices: [],
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      }
      cityGroup.clientGroups.push(clientGroup)
    }

    clientGroup.invoices.push(invoice)
    clientGroup.totalInvoices++
    clientGroup.totalAmount += total
    clientGroup.totalPaid += paid
    clientGroup.totalPending += pending

    cityGroup.totalInvoices++
    cityGroup.totalAmount += total
    cityGroup.totalPaid += paid
    cityGroup.totalPending += pending

    return groups
  }, [])

  const toggleCity = (cityKey: string) => {
    const newExpanded = new Set(expandedCities)
    if (newExpanded.has(cityKey)) {
      newExpanded.delete(cityKey)
    } else {
      newExpanded.add(cityKey)
    }
    setExpandedCities(newExpanded)
  }

  const toggleClient = (clientDocument: string) => {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientDocument)) {
      newExpanded.delete(clientDocument)
    } else {
      newExpanded.add(clientDocument)
    }
    setExpandedClients(newExpanded)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "paga":
        return "bg-green-100 text-green-800"
      case "partial":
      case "parcial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
      case "pendente":
        return "bg-blue-100 text-blue-800"
      case "overdue":
      case "vencida":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "paga":
        return "Paga"
      case "partial":
      case "parcial":
        return "Parcial"
      case "pending":
      case "pendente":
        return "Pendente"
      case "overdue":
      case "vencida":
        return "Vencida"
      default:
        return status
    }
  }

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    setInvoiceToDelete({ id: invoiceId, number: invoiceNumber })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteInvoice(invoiceToDelete.id)

      if (result.success) {
        toast({
          title: "Nota fiscal excluída",
          description: `A nota fiscal ${invoiceToDelete.number} foi excluída com sucesso.`,
        })
        await fetchInvoices()
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.error || "Não foi possível excluir a nota fiscal.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting invoice:", error)
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado ao excluir a nota fiscal.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setInvoiceToDelete(null)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Notas Fiscais</h1>
        </nav>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/import">Importar XML de NF-e</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/invoices/new">Nova Nota Fiscal</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Notas Fiscais</h2>
            <p className="text-muted-foreground">
              Gerencie suas notas fiscais eletrônicas agrupadas por cidade e cliente
            </p>
          </div>
        </div>

        <InvoiceStats invoices={invoices} />

        <div className="space-y-6">
          {cityGroups.map((cityGroup) => {
            const cityKey = `${cityGroup.city}, ${cityGroup.state}`
            return (
              <div key={cityKey} className="space-y-2">
                <Card className="bg-muted/30 w-full">
                  <CardHeader
                    className="cursor-pointer hover:bg-muted/50 transition-colors py-1"
                    onClick={() => toggleCity(cityKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {expandedCities.has(cityKey) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">{cityKey}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {expandedCities.has(cityKey) && (
                  <div className="ml-6 space-y-3">
                    {cityGroup.clientGroups.map((group) => (
                      <Card key={group.client.document} className="overflow-hidden">
                        <CardHeader
                          className="cursor-pointer hover:bg-muted/50 transition-colors py-3"
                          onClick={() => toggleClient(group.client.document)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedClients.has(group.client.document) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <CardTitle className="text-base">{group.client.name}</CardTitle>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {group.client.document_type}: {group.client.document}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-right">
                              <div>
                                <p className="text-sm font-medium">{group.totalInvoices}</p>
                                <p className="text-xs text-muted-foreground">NF-e</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  R$ {group.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Emitido</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-600">
                                  R$ {group.totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Pago</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-600">
                                  R$ {group.totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-xs text-muted-foreground">Total Pendente</p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        {expandedClients.has(group.client.document) && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {group.invoices.map((invoice) => (
                                <div
                                  key={invoice.id}
                                  className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <Link
                                      href={`/dashboard/invoices/${invoice.id}`}
                                      className="flex items-center gap-3 flex-1"
                                    >
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">NF-e {invoice.invoice_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Emitida em {new Date(invoice.issue_date).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                    </Link>

                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <p className="font-medium">
                                          R${" "}
                                          {getNumber(invoice.total_amount).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                          })}
                                        </p>
                                        {getNumber(invoice.amount_paid) > 0 && (
                                          <p className="text-sm text-green-600">
                                            Pago: R${" "}
                                            {getNumber(invoice.amount_paid).toLocaleString("pt-BR", {
                                              minimumFractionDigits: 2,
                                            })}
                                          </p>
                                        )}
                                      </div>
                                      <Badge className={getStatusColor(invoice.status)}>
                                        {getStatusLabel(invoice.status)}
                                      </Badge>
                                      {(invoice.status === "pending" ||
                                        invoice.status === "Pendente" ||
                                        invoice.status === "pendente" ||
                                        invoice.status === "partial" ||
                                        invoice.status === "Parcial" ||
                                        invoice.status === "parcial" ||
                                        getNumber(invoice.amount_paid) < getNumber(invoice.total_amount)) && (
                                        <Button
                                          size="sm"
                                          variant="default"
                                          asChild
                                          className="gap-2 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Link href={`/dashboard/invoices/${invoice.id}/payment`}>
                                            <CreditCard className="h-4 w-4" />
                                            Registrar Pagamento
                                          </Link>
                                        </Button>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="gap-2 shrink-0"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteClick(invoice.id, invoice.invoice_number)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Excluir
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a nota fiscal {invoiceToDelete?.number}? Esta ação não pode ser desfeita.
              <br />
              <br />
              Serão excluídos:
              <ul className="list-disc list-inside mt-2">
                <li>A nota fiscal</li>
                <li>Todos os pagamentos associados</li>
                <li>Todos os itens da nota fiscal</li>
              </ul>
              <br />O cadastro do cliente será mantido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
