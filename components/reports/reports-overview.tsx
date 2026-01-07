"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar } from "lucide-react"

interface Invoice {
  id: string
  total_amount: number
  status: string
  issue_date: string
  created_at: string
}

interface Client {
  id: string
  created_at: string
}

interface ReportsOverviewProps {
  invoices: Invoice[]
  clients: Client[]
}

export function ReportsOverview({ invoices, clients }: ReportsOverviewProps) {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  // Current month data
  const thisMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.issue_date)
    return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
  })

  // Last month data
  const lastMonthInvoices = invoices.filter((invoice) => {
    const invoiceDate = new Date(invoice.issue_date)
    return invoiceDate.getMonth() === lastMonth && invoiceDate.getFullYear() === lastMonthYear
  })

  const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

  const thisMonthClients = clients.filter((client) => {
    const clientDate = new Date(client.created_at)
    return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear
  }).length

  const lastMonthClients = clients.filter((client) => {
    const clientDate = new Date(client.created_at)
    return clientDate.getMonth() === lastMonth && clientDate.getFullYear() === lastMonthYear
  }).length

  const clientsGrowth = lastMonthClients > 0 ? ((thisMonthClients - lastMonthClients) / lastMonthClients) * 100 : 0

  const averageInvoiceValue = thisMonthInvoices.length > 0 ? thisMonthRevenue / thisMonthInvoices.length : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento do Mês</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</div>
          <div className="flex items-center text-xs">
            {revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(revenueGrowth)}
            </span>
            <span className="text-muted-foreground ml-1">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">NF-e do Mês</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthInvoices.length}</div>
          <p className="text-xs text-muted-foreground">
            {thisMonthInvoices.length - lastMonthInvoices.length > 0 ? "+" : ""}
            {thisMonthInvoices.length - lastMonthInvoices.length} vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{thisMonthClients}</div>
          <div className="flex items-center text-xs">
            {clientsGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={clientsGrowth >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(clientsGrowth)}
            </span>
            <span className="text-muted-foreground ml-1">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageInvoiceValue)}</div>
          <p className="text-xs text-muted-foreground">Valor médio por NF-e</p>
        </CardContent>
      </Card>
    </div>
  )
}
