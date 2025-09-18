"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Invoice {
  id: string
  total_amount: number
  status: string
  payment_method?: string
}

interface PaymentMethodsReportProps {
  invoices: Invoice[]
}

export function PaymentMethodsReport({ invoices }: PaymentMethodsReportProps) {
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid" && invoice.payment_method)

  const paymentMethodsMap = new Map()

  paidInvoices.forEach((invoice) => {
    const method = invoice.payment_method || "Não informado"
    const current = paymentMethodsMap.get(method) || { count: 0, amount: 0 }
    paymentMethodsMap.set(method, {
      count: current.count + 1,
      amount: current.amount + invoice.total_amount,
    })
  })

  const paymentMethodsData = Array.from(paymentMethodsMap.entries())
    .map(([method, data]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1).replace("_", " "),
      count: data.count,
      amount: data.amount,
    }))
    .sort((a, b) => b.amount - a.amount)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (paymentMethodsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Distribuição por método de pagamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum pagamento registrado ainda
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <CardDescription>Distribuição por método de pagamento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={paymentMethodsData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={formatCurrency} />
            <YAxis dataKey="method" type="category" width={100} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Valor"]}
              labelFormatter={(label) => `Método: ${label}`}
            />
            <Bar dataKey="amount" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
