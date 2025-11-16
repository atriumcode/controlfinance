import { Badge } from "@/components/ui/badge"

type InvoiceStatus = "paid" | "pending" | "partial" | "overdue"

interface StatusBadgeProps {
  status: InvoiceStatus
}

const statusConfig = {
  paid: {
    label: "Paga",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  pending: {
    label: "Pendente",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  partial: {
    label: "Parcial",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  overdue: {
    label: "Vencida",
    className: "bg-red-100 text-red-800 border-red-200",
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as InvoiceStatus
  const config = statusConfig[normalizedStatus] || statusConfig.pending

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  )
}
