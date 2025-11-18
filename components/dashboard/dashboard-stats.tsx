"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Clientes</CardTitle>
          <Users className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{clientsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Clientes cadastrados</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Notas Fiscais</CardTitle>
          <FileText className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground mt-1">NF-e emitidas</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total</CardTitle>
          <DollarSign className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Valor total das NF-e</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Este Mês</CardTitle>
          <TrendingUp className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(thisMonthRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {growthPercentage > 0 ? "+" : ""}
            {growthPercentage.toFixed(1)}% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recebido</CardTitle>
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-600">{formatCurrency(totalReceivedRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {paidInvoices.length} pagas + {partialInvoices.length} parciais
          </p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm hover:shadow-md transition-shadow bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">A Receber</CardTitle>
          <Clock className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-amber-600">{formatCurrency(pendingRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
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
