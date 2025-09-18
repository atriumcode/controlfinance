"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  status: string
  issue_date: string
  clients?: {
    name: string
  } | null
}

interface RecentInvoicesProps {
  invoices: Invoice[]
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas Fiscais Recentes</CardTitle>
        <CardDescription>Últimas 5 NF-e emitidas</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/invoices/new">Criar Primeira NF-e</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">NF-e {invoice.invoice_number}</p>
                    <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {invoice.clients?.name || "Cliente não informado"} • {formatDate(invoice.issue_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/invoices/${invoice.id}`}>Ver</Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/invoices">Ver Todas</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
