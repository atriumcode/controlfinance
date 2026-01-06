"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Invoice {
  id: string
  total_amount: number
  status: string
  issue_date: string
}

interface RevenueChartProps {
  invoices: Invoice[]
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  // Generate last 6 months data
  const monthsData = []
  const currentDate = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthName = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })

    const monthInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.issue_date)
      return invoiceDate.getMonth() === date.getMonth() && invoiceDate.getFullYear() === date.getFullYear()
    })

    const totalRevenue = monthInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
    const paidRevenue = monthInvoices
      .filter((invoice) => invoice.status === "paid")
      .reduce((sum, invoice) => sum + invoice.total_amount, 0)

    monthsData.push({
      month: monthName,
      total: totalRevenue,
      paid: paidRevenue,
      pending: totalRevenue - paidRevenue,
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
        <CardTitle>Faturamento por Mês</CardTitle>
        <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={monthsData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Bar dataKey="paid" stackId="a" fill="#22c55e" name="Recebido" />
        <Bar dataKey="pending" stackId="a" fill="#eab308" name="Pendente" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</CardContent>
    </Card>
  )
}
