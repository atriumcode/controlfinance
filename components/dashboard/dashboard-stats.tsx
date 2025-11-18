"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Users, TrendingUp, Clock, CheckCircle } from "lucide-react"

interface Invoice {
  id: string
  total_amount: number
  amount_paid?: number
  status: string
  issue_date: string
  created_at: string
}

interface DashboardStatsProps {
  invoices: Invoice[]
  clientsCount: number
}

export function DashboardStats({ invoices, clientsCount }: DashboardStatsProps) {
  const totalInvoices = invoices.length
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid")
  const partialInvoices = invoices.filter((invoice) => invoice.status === "Parcial")
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "pending" || invoice.status === "overdue")

  const totalReceivedRevenue = invoices.reduce((sum, invoice) => {
    if (invoice.status === "paid") {
      return sum + invoice.total_amount
    } else {
      return sum + (invoice.amount_paid || 0)
    }
  }, 0)

  const pendingRevenue = invoices.reduce((sum, invoice) => {
    const amountPaid = invoice.amount_paid || 0
    const remaining = invoice.total_amount - amountPaid
    return sum + (remaining > 0 ? remaining : 0)
  }, 0)

  // Calculate this month's data
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.issue_date)
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
  })
  const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)

  // Calculate growth (simplified - comparing to last month)
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const lastMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.issue_date)
    return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear
  })
  const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const growthPercentage = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{clientsCount}</div>
          <p className="text-xs text-muted-foreground">Clientes cadastrados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Notas Fiscais</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground">NF-e emitidas</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Valor total das NF-e</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {growthPercentage > 0 ? "+" : ""}
            {growthPercentage.toFixed(1)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recebido</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReceivedRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {paidInvoices.length} pagas + {partialInvoices.length} parciais
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">A Receber</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {
              invoices.filter((invoice) => {
                const amountPaid = invoice.amount_paid || 0
                return invoice.total_amount - amountPaid > 0
              }).length
            }{" "}
            NF-e com saldo pendente
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
