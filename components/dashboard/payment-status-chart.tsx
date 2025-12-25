"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface Invoice {
  status: "paid" | "partial" | "pending"
}

interface PaymentStatusChartProps {
  invoices: Invoice[]
}

export function PaymentStatusChart({ invoices }: PaymentStatusChartProps) {
  const counts = {
    paid: 0,
    partial: 0,
    pending: 0,
  }

  invoices.forEach((inv) => {
    if (inv.status === "paid") counts.paid++
    if (inv.status === "partial") counts.partial++
    if (inv.status === "pending") counts.pending++
  })

  const data = [
    { name: "Pagas", value: counts.paid, color: "#16a34a" },
    { name: "Parciais", value: counts.partial, color: "#facc15" },
    { name: "Pendentes", value: counts.pending, color: "#f97316" },
  ].filter(item => item.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Pagamentos</CardTitle>
        <p className="text-sm text-muted-foreground">Distribuição por status</p>
      </CardHeader>

      <CardContent className="h-[260px] flex items-center justify-center">
        {data.length === 0 ? (
          <span className="text-muted-foreground">
            Nenhuma nota fiscal encontrada
          </span>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
