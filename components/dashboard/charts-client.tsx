"use client"

import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { PaymentStatusChart } from "@/components/dashboard/payment-status-chart"

interface Props {
  invoices: any[]
}

export function DashboardCharts({ invoices }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <RevenueChart invoices={invoices} />
      <PaymentStatusChart invoices={invoices} />
    </div>
  )
}
