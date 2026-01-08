"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Invoice {
  id: string
  total_amount: number
  status: string
  issue_date: string
}

interface MonthlyReportProps {
  invoices: Invoice[]
}

export function MonthlyReport({ invoices }: MonthlyReportProps) {
  // Generate last 12 months data
  const monthsData = []
  const currentDate = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthName = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

    const monthInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.issue_date)
      return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear()
    })

    const totalRevenue = monthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    const invoiceCount = monthInvoices.length

    monthsData.push({
      month: monthName,
      revenue: totalRevenue,
      count: invoiceCount,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
        <CardDescription>Faturamento dos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Faturamento"]}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
