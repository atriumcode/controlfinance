"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, CreditCard } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  amount_paid: number
  status: string
  clients?: {
    name: string
  } | null
}

interface PaymentFormProps {
  invoice: Invoice
}

const paymentMethods = [
  { value: "pix", label: "PIX" },
  { value: "ted", label: "TED" },
  { value: "doc", label: "DOC" },
  { value: "boleto", label: "Boleto Bancário" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "cheque", label: "Cheque" },
  { value: "outros", label: "Outros" },
]

export function PaymentForm({ invoice }: PaymentFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const totalAmount = Number(invoice.total_amount || 0)
  const alreadyPaid = Number(invoice.amount_paid || 0)
  const remainingAmount = Math.max(totalAmount - alreadyPaid, 0)

  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    amount_paid: remainingAmount,
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const finalRemaining = Math.max(
    totalAmount - (alreadyPaid + formData.amount_paid),
    0
  )

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!formData.payment_method) {
      setError("Selecione um método de pagamento.")
      setIsLoading(false)
      return
    }

    if (formData.amount_paid <= 0) {
      setError("O valor pago deve ser maior que zero.")
      setIsLoading(false)
      return
    }

    if (formData.amount_paid > remainingAmount) {
      setError("O valor do pagamento excede o saldo restante da NF-e.")
      setIsLoading(false)
      return
    }

    try {
      // Registrar pagamento
      const { error: paymentError } = await supabase.from("payments").insert({
        invoice_id: invoice.id,
        amount: formData.amount_paid,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
      })

      if (paymentError) throw paymentError

      const newAmountPaid = alreadyPaid + formData.amount_paid

      let newStatus: "pending" | "partial" | "paid" = "pending"
      if (newAmountPaid >= totalAmount) newStatus = "paid"
      else if (newAmountPaid > 0) newStatus = "partial"

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq("id", invoice.id)

      if (updateError) throw updateError

      setSuccess(true)

      setTimeout(() => {
        router.push(`/dashboard/invoices/${invoice.id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message || "Erro ao registrar pagamento.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h3 className="text-lg font-semibold">Pagamento registrado!</h3>
          <Button onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
            Voltar para NF-e
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (remainingAmount === 0) {
    return (
      <Alert>
        <AlertDescription>
          Esta NF-e já está totalmente paga.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Registrar Pagamento
          </CardTitle>
          <CardDescription>
            NF-e {invoice.invoice_number}
            {invoice.clients && ` — ${invoice.clients.name}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Valor total: {formatCurrency(totalAmount)} <br />
              Já pago: {formatCurrency(alreadyPaid)} <br />
              Saldo restante: {formatCurrency(remainingAmount)}
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) =>
                  setFormData({ ...formData, payment_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Método de Pagamento</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData({ ...formData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Valor Pago</Label>
            <Input
              type="number"
              min="0.01"
              max={remainingAmount}
              step="0.01"
              value={formData.amount_paid}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount_paid: Math.min(
                    Number(e.target.value) || 0,
                    remainingAmount
                  ),
                })
              }
            />
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <span>Saldo após pagamento:</span>
            <strong
              className={
                finalRemaining === 0 ? "text-green-600" : "text-yellow-600"
              }
            >
              {formatCurrency(finalRemaining)}
            </strong>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Pagamento"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
