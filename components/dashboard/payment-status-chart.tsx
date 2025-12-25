"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Payment {
  payment_method: string
  amount: number
}

const COLORS = [
  "#16a34a", // verde
  "#2563eb", // azul
  "#f97316", // laranja
  "#facc15", // amarelo
  "#9333ea", // roxo
  "#0ea5e9", // ciano
]

export function PaymentStatusChart({ payments }: { payments: Payment[] }) {
  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribuição por método de pagamento
          </p>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum pagamento registrado ainda
        </CardContent>
      </Card>
    )
  }

  const grouped = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.payment_method] = (acc[p.payment_method] || 0) + Number(p.amount)
    return acc
  }, {})

  const data = Object.entries(grouped).map(([method, value]) => ({
    name: method.toUpperCase(),
    value,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métodos de Pagamento</CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribuição por método de pagamento
        </p>
      </CardHeader>

      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
