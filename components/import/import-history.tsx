"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

interface ImportedInvoice {
  id: string
  invoice_number: string
  nfe_key: string
  issue_date: string
  total_amount: number
  status: string
  created_at: string
  clients: {
    name: string
  } | null
}

export function ImportHistory() {
  const [invoices, setInvoices] = useState<ImportedInvoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchImportHistory = async () => {
      const supabase = createClient()

      const response = await fetch("/api/user/profile")
      if (!response.ok) return

      const { company_id } = await response.json()
      if (!company_id) return

      // Get recent imported invoices (those with XML content)
      const { data } = await supabase
        .from("invoices")
        .select(
          `
          id,
          invoice_number,
          nfe_key,
          issue_date,
          total_amount,
          status,
          created_at,
          clients (
            name
          )
        `,
        )
        .eq("company_id", company_id)
        .not("xml_content", "is", null)
        .order("created_at", { ascending: false })
        .limit(10)

      setInvoices(data || [])
      setIsLoading(false)
    }

    fetchImportHistory()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "Parcial":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Importações</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Importações</CardTitle>
        <CardDescription>Últimas NF-e importadas via XML</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma NF-e importada ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">NF-e {invoice.invoice_number}</h4>
                      <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                    </div>
                    {invoice.clients && <p className="text-sm text-muted-foreground">{invoice.clients.name}</p>}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Emissão: {formatDate(invoice.issue_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>

                {invoice.nfe_key && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Chave NF-e:</span> {invoice.nfe_key}
                  </div>
                )}
              </div>
            ))}

            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/invoices">Ver Todas as Notas Fiscais</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
