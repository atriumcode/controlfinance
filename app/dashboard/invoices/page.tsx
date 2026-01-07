"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  ChevronDown,
  ChevronRight,
  FileText,
  MapPin,
  CreditCard,
  Trash2,
} from "lucide-react"

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

/* =========================
   TYPES
========================= */

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
  client: NonNullable<Invoice["clients"]>
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

/* =========================
   HELPERS
========================= */

const getNumber = (value: any): number => {
  const n = Number(value)
  return isNaN(n) ? 0 : n
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
    case "paga":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
    case "partial":
    case "parcial":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
    case "pending":
    case "pendente":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
    case "overdue":
    case "vencida":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    default:
      return "bg-muted text-muted-foreground"
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

/* =========================
   PAGE
========================= */

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<{ id: string; number: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  /* =========================
     FETCH
  ========================= */

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (!res.ok) {
        router.push("/auth/login")
        return
      }

      const profile = await res.json()
      if (!profile.company_id) {
        router.push("/dashboard/settings")
        return
      }

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          amount_paid,
          status,
          issue_date,
          due_date,
          clients (
            name,
            document,
            document_type,
            city,
            state
          )
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) throw error

      setInvoices(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  /* =========================
     GROUP DATA
  ========================= */

  const cityGroups: CityGroup[] = invoices.reduce((groups: CityGroup[], invoice) => {
    const total = getNumber(invoice.total_amount)
    const paid = getNumber(invoice.amount_paid)
    const pending = total - paid

    const cityKey = invoice.clients
      ? `${invoice.clients.city}, ${invoice.clients.state}`
      : "Cidade não informada"

    let cityGroup = groups.find(
      (g) => `${g.city}, ${g.state}` === cityKey
    )

    if (!cityGroup) {
      cityGroup = {
        city: invoice.clients?.city || "Cidade não informada",
        state: invoice.clients?.state || "",
        clientGroups: [],
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      }
      groups.push(cityGroup)
    }

    if (!invoice.clients) return groups

    let clientGroup = cityGroup.clientGroups.find(
      (g) => g.client.document === invoice.clients!.document
    )

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
    clientGroup.totalAmount += total
    clientGroup.totalPaid += paid
    clientGroup.totalPending += pending

    cityGroup.totalInvoices++
    cityGroup.totalAmount += total
    cityGroup.totalPaid += paid
    cityGroup.totalPending += pending

    return groups
  }, [])

  /* =========================
     DELETE
  ========================= */

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return

    setIsDeleting(true)
    const result = await deleteInvoice(invoiceToDelete.id)

    if (result.success) {
      toast({ title: "Nota fiscal excluída com sucesso" })
      fetchInvoices()
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas Fiscais"
        description="Gerencie suas notas fiscais eletrônicas agrupadas por cidade e cliente"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/import">Importar XML</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/invoices/new">Nova Nota Fiscal</Link>
            </Button>
          </>
        }
      />

      <InvoiceStats invoices={invoices} />

      <div className="space-y-6">
        {cityGroups.map((cityGroup) => {
          const cityKey = `${cityGroup.city}, ${cityGroup.state}`

          return (
            <div key={cityKey} className="space-y-2">
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    const next = new Set(expandedCities)
                    next.has(cityKey) ? next.delete(cityKey) : next.add(cityKey)
                    setExpandedCities(next)
                  }}
                >
                  <CardTitle className="flex items-center gap-2 text-sm">
                    {expandedCities.has(cityKey) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <MapPin className="h-4 w-4 text-primary" />
                    {cityKey}
                  </CardTitle>
                </CardHeader>
              </Card>

              {expandedCities.has(cityKey) && (
                <div className="ml-6 space-y-4">
                  {cityGroup.clientGroups.map((group) => (
                    <Card key={group.client.document}>
                      <CardHeader
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          const next = new Set(expandedClients)
                          next.has(group.client.document)
                            ? next.delete(group.client.document)
                            : next.add(group.client.document)
                          setExpandedClients(next)
                        }}
                      >
                        <CardTitle className="flex items-center gap-2 text-base">
                          {expandedClients.has(group.client.document) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {group.client.name}
                        </CardTitle>
                      </CardHeader>

                      {expandedClients.has(group.client.document) && (
                        <CardContent className="space-y-3">
                          {group.invoices.map((invoice) => (
                            <div
                              key={invoice.id}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <Link
                                href={`/dashboard/invoices/${invoice.id}`}
                                className="flex items-center gap-3"
                              >
                                <FileText className="h-4 w-4" />
                                NF-e {invoice.invoice_number}
                              </Link>

                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(invoice.status)}>
                                  {getStatusLabel(invoice.status)}
                                </Badge>

                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => {
                                    setInvoiceToDelete({
                                      id: invoice.id,
                                      number: invoice.invoice_number,
                                    })
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a nota fiscal{" "}
              {invoiceToDelete?.number}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
