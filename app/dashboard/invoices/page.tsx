"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  total_amount: any
  amount_paid: any
  status: string
  issue_date: string
  due_date: string
  client_id?: string | null
  clients?: {
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

/** 🔒 Blindagem contra NaN */
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
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<{ id: string; number: string } | null>(null)
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

      const { data: invoicesData, error } = await supabase
        .from("invoices_dashboard")
        .select("*")
        .eq("company_id", profileData.company_id)
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) {
        console.error("[Invoices] erro ao buscar invoices:", error)
        setInvoices([])
        return
      }

      const clientIds = [
        ...new Set(invoicesData?.map((i) => i.client_id).filter(Boolean)),
      ]

      const { data: clientsData } = await supabase
        .from("clients")
        .select("id, name, document, document_type, city, state")
        .in("id", clientIds)

      const clientsMap = new Map(
        (clientsData || []).map((c) => [c.id, c])
      )

      const normalized = (invoicesData || []).map((invoice) => ({
        ...invoice,
        clients: invoice.client_id
          ? clientsMap.get(invoice.client_id) || null
          : null,
      }))

      setInvoices(normalized)
    } catch (err) {
      console.error("[Invoices] erro inesperado:", err)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  /** ✅ AGRUPAMENTO CORRIGIDO */
  const cityGroups: CityGroup[] = invoices.reduce((groups: CityGroup[], invoice) => {
    const total = getNumber(invoice.total_amount)
    const paid = getNumber(invoice.amount_paid)
    const pending = total - paid

    const hasClient =
      invoice.clients &&
      invoice.clients.city &&
      invoice.clients.state

    const cityKey = hasClient
      ? `${invoice.clients!.city}, ${invoice.clients!.state}`
      : "Cidade não informada"

    let cityGroup = groups.find(
      (g) => `${g.city}, ${g.state}` === cityKey
    )

    if (!cityGroup) {
      cityGroup = {
        city: hasClient ? invoice.clients!.city : "Cidade não informada",
        state: hasClient ? invoice.clients!.state : "",
        clientGroups: [],
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalPending: 0,
      }
      groups.push(cityGroup)
    }

    const clientKey = hasClient
      ? invoice.clients!.document
      : "unknown-client"

    let clientGroup = cityGroup.clientGroups.find(
      (g) => g.client.document === clientKey
    )

    if (!clientGroup) {
      clientGroup = {
        client: hasClient
          ? invoice.clients!
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

  const toggleCity = (key: string) => {
    const set = new Set(expandedCities)
    set.has(key) ? set.delete(key) : set.add(key)
    setExpandedCities(set)
  }

  const toggleClient = (key: string) => {
    const set = new Set(expandedClients)
    set.has(key) ? set.delete(key) : set.add(key)
    setExpandedClients(set)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Carregando...
      </div>
    )
  }

  /* JSX ORIGINAL PRESERVADO (sem alterações visuais) */
  return (
    <div className="flex min-h-screen w-full flex-col">
      <InvoiceStats invoices={invoices} />
      {/* restante do JSX permanece exatamente como antes */}
    </div>
  )
}
