"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Clock, CheckCircle } from "lucide-react"

interface Invoice {
  id: string
  total_amount: number
  amount_paid?: number
  status: string
  issue_date: string
}

interface InvoiceStatsProps {
  invoices: Invoice[]
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length
  const partialInvoices = invoices.filter((invoice) => invoice.status === "Parcial").length
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "pending").length
  const overdueInvoices = invoices.filter((invoice) => {
    if (invoice.status === "overdue") return true
    return false
  }).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const paidAmount = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.total_amount, 0)

  const partialAmount = invoices
    .filter((invoice) => invoice.status === "Parcial")
    .reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0)

  const totalReceivedAmount = paidAmount + partialAmount

  const pendingAmount = invoices.reduce((sum, invoice) => {
    const amountPaid = invoice.amount_paid || 0
    const remaining = invoice.total_amount - amountPaid
    return sum + (remaining > 0 ? remaining : 0)
  }, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de NF-e</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground">Notas fiscais cadastradas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          <p className="text-xs text-muted-foreground">Valor total das NF-e</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{paidInvoices + partialInvoices}</div>
          <p className="text-xs text-muted-foreground">{formatCurrency(totalReceivedAmount)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingInvoices + overdueInvoices + partialInvoices}
          </div>
          <p className="text-xs text-muted-foreground">{formatCurrency(pendingAmount)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
