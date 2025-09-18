"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface Invoice {
  id: string
  total_amount: number
  status: string
}

interface PaymentStatusChartProps {
  invoices: Invoice[]
}

export function PaymentStatusChart({ invoices }: PaymentStatusChartProps) {
  const statusData = [
    {
      name: "Pagas",
      value: invoices.filter((invoice) => invoice.status === "paid").length,
      amount: invoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      color: "#22c55e",
    },
    {
      name: "Pendentes",
      value: invoices.filter((invoice) => invoice.status === "pending").length,
      amount: invoices
        .filter((invoice) => invoice.status === "pending")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      color: "#eab308",
    },
    {
      name: "Parciais",
      value: invoices.filter((invoice) => invoice.status === "Parcial").length,
      amount: invoices
        .filter((invoice) => invoice.status === "Parcial")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      color: "#3b82f6",
    },
    {
      name: "Vencidas",
      value: invoices.filter((invoice) => invoice.status === "overdue").length,
      amount: invoices
        .filter((invoice) => invoice.status === "overdue")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      color: "#ef4444",
    },
    {
      name: "Canceladas",
      value: invoices.filter((invoice) => invoice.status === "cancelled").length,
      amount: invoices
        .filter((invoice) => invoice.status === "cancelled")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0),
      color: "#6b7280",
    },
  ].filter((item) => item.value > 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} NF-e - {formatCurrency(data.amount)}
          </p>
        </div>
      )
    }
    return null
  }

  if (statusData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Pagamentos</CardTitle>
          <CardDescription>Distribuição por status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhuma nota fiscal encontrada
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Pagamentos</CardTitle>
        <CardDescription>Distribuição por status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
