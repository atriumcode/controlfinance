"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight, FileText, MapPin } from "lucide-react"
import Link from "next/link"
import { InvoiceStats } from "@/components/invoices/invoice-stats"

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
  const router = useRouter()

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

      const { data: invoicesData } = await supabase
        .from("invoices")
        .select(`
          *,
          amount_paid,
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

      setInvoices(invoicesData || [])
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
    if (!invoice.clients || !invoice.clients.city || !invoice.clients.state) {
      console.warn(`Invoice ${invoice.invoice_number} has missing client data, skipping grouping`)
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
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "Parcial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paga"
      case "Parcial":
        return "Parcial"
      case "pending":
        return "Pendente"
      case "overdue":
        return "Vencida"
      default:
        return status
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
                                <Link
                                  key={invoice.id}
                                  href={`/dashboard/invoices/${invoice.id}`}
                                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="font-medium">NF-e {invoice.invoice_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Emitida em {new Date(invoice.issue_date).toLocaleDateString("pt-BR")}
                                        </p>
                                      </div>
                                    </div>

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
                                    </div>
                                  </div>
                                </Link>
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
    </div>
  )
}
