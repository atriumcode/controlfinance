"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, FileText, MapPin, CreditCard, Trash2 } from 'lucide-react'
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
import { PageHeader } from "@/components/shared/page-header"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  amount_paid: number
  status: string
  issue_date: string
  due_date: string
  clients: {
    name: string
    document: string
    document_type: string
    city: string
    state: string
  }
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

      const invoicesResponse = await fetch(`/api/invoices?company_id=${profileData.company_id}`)

      if (!invoicesResponse.ok) {
        console.error("[v0] Error fetching invoices")
        setInvoices([])
        setLoading(false)
        return
      }

      const invoicesWithClients = await invoicesResponse.json()

      console.log("[v0] Total invoices fetched:", invoicesWithClients?.length)
      setInvoices(invoicesWithClients || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const cityGroups: CityGroup[] = invoices.reduce((groups: CityGroup[], invoice, index) => {
    if (!invoice.clients || !invoice.clients.city || !invoice.clients.state) {
      const cityKey = "Sem Cliente"
      let cityGroup = groups.find((g) => g.city === cityKey)

      if (!cityGroup) {
        cityGroup = {
          city: cityKey,
          state: "",
          clientGroups: [],
          totalInvoices: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalPending: 0,
        }
        groups.push(cityGroup)
      }

      const clientKey = `unknown-${invoice.id}`
      let clientGroup = cityGroup.clientGroups.find((g) => g.client.document === clientKey)

      if (!clientGroup) {
        clientGroup = {
          client: {
            name: "Cliente Não Identificado",
            document: clientKey,
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
      clientGroup.totalAmount += invoice.total_amount
      clientGroup.totalPaid += invoice.amount_paid || 0
      clientGroup.totalPending += invoice.total_amount - (invoice.amount_paid || 0)

      cityGroup.totalInvoices++
      cityGroup.totalAmount += invoice.total_amount
      cityGroup.totalPaid += invoice.amount_paid || 0
      cityGroup.totalPending += invoice.total_amount - (invoice.amount_paid || 0)

      return groups
    }

    const cityKey = `${invoice.clients.city}, ${invoice.clients.state}`
    let cityGroup = groups.find((g) => `${g.city}, ${g.state}` === cityKey)

    if (!cityGroup) {
      cityGroup = {
        city: invoice.clients.city,
        state: invoice.clients.state,
        clientGroups: [],
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      }
      groups.push(cityGroup)
    }

    const clientKey = invoice.clients.document
    let clientGroup = cityGroup.clientGroups.find((g) => g.client.document === clientKey)

    if (!clientGroup) {
      clientGroup = {
        client: invoice.clients,
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
    clientGroup.totalAmount += invoice.total_amount
    clientGroup.totalPaid += invoice.amount_paid || 0
    clientGroup.totalPending += invoice.total_amount - (invoice.amount_paid || 0)

    cityGroup.totalInvoices++
    cityGroup.totalAmount += invoice.total_amount
    cityGroup.totalPaid += invoice.amount_paid || 0
    cityGroup.totalPending += invoice.total_amount - (invoice.amount_paid || 0)

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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <PageHeader
          title="Notas Fiscais"
          description="Gerencie suas notas fiscais eletrônicas agrupadas por cidade e cliente"
          action={
            <div className="flex gap-2">
              <Button variant="outline" asChild className="border-gray-300 bg-transparent">
                <Link href="/dashboard/import">Importar XML de NF-e</Link>
              </Button>
              <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
                <Link href="/dashboard/invoices/new">Nova Nota Fiscal</Link>
              </Button>
            </div>
          }
        />

        <InvoiceStats invoices={invoices} />

        <div className="space-y-4">
          {cityGroups.map((cityGroup) => {
            const cityKey = `${cityGroup.city}, ${cityGroup.state}`
            return (
              <div key={cityKey} className="space-y-2">
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
                    onClick={() => toggleCity(cityKey)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {expandedCities.has(cityKey) ? (
                          <ChevronDown className="h-5 w-5 text-purple-600" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-purple-600" />
                        )}
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-base font-semibold text-gray-900">{cityKey}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {expandedCities.has(cityKey) && (
                  <div className="ml-6 space-y-2">
                    {cityGroup.clientGroups.map((group) => (
                      <Card
                        key={group.client.document}
                        className="border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardHeader
                          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
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
                                  className="p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
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
                                          {invoice.total_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                        {invoice.amount_paid > 0 && (
                                          <p className="text-sm text-green-600">
                                            Pago: R${" "}
                                            {invoice.amount_paid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                                        invoice.amount_paid < invoice.total_amount) && (
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
