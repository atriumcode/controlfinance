import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, DollarSign, FileText } from "lucide-react"

interface Invoice {
  total_amount: number | string | null
  amount_paid: number | string | null
  status: string
}

/** Blindagem contra NaN, null e undefined */
const getNumber = (value: any): number => {
  const n = Number(value)
  return isNaN(n) ? 0 : n
}

interface InvoiceStatsProps {
  invoices: Invoice[]
}

export function InvoiceStats({ invoices }: InvoiceStatsProps) {
  const totalInvoices = invoices.length

  const totalAmount = invoices.reduce(
    (sum, inv) => sum + getNumber(inv.total_amount),
    0
  )

  const totalPaid = invoices.reduce(
    (sum, inv) => sum + getNumber(inv.amount_paid),
    0
  )

  const totalPending = totalAmount - totalPaid

  const paidInvoices = invoices.filter(
    (inv) =>
      getNumber(inv.amount_paid) >= getNumber(inv.total_amount) &&
      getNumber(inv.total_amount) > 0
  ).length

  const pendingInvoices = totalInvoices - paidInvoices

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de NF-e</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Notas fiscais cadastradas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            R$ {totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor total das NF-e
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pagas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {paidInvoices}
          </div>
          <p className="text-xs text-muted-foreground">
            R$ {totalPaid.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">
            {pendingInvoices}
          </div>
          <p className="text-xs text-muted-foreground">
            R$ {totalPending.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
