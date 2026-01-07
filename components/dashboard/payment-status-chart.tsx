"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

interface Invoice {
  status: "paid" | "partial" | "pending"
}

interface PaymentStatusChartProps {
  invoices: Invoice[]
}

export function PaymentStatusChart({ invoices }: PaymentStatusChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
  ].filter((item) => item.value > 0)

  const total = data.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Pagamentos</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição por status
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[320px] w-full min-h-[320px]">
          {!mounted ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Carregando gráfico…
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Nenhuma nota fiscal encontrada
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>

                {/* Total no centro */}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-xl font-bold"
                >
                  {total}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-sm"
                >
                  NF-e
                </text>

                <Tooltip
                  formatter={(value: number) => [
                    `${value} NF-e`,
                    "Quantidade",
                  ]}
                />

                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span className="text-sm">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
