"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, CreditCard } from "lucide-react"

interface Invoice {
  id: string
  invoice_number: string
  total_amount: number
  net_amount: number
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
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    amount_paid: invoice.total_amount,
    notes: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!formData.payment_method) {
      setError("Selecione um método de pagamento")
      setIsLoading(false)
      return
    }

    if (formData.amount_paid <= 0) {
      setError("O valor pago deve ser maior que zero")
      setIsLoading(false)
      return
    }

    try {
      const paymentData = {
        invoice_id: invoice.id,
        amount: formData.amount_paid,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes || null,
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao registrar pagamento")
      }

      setSuccess(true)

      setTimeout(() => {
        router.push(`/dashboard/invoices/${invoice.id}`)
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao registrar pagamento")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold">Pagamento Registrado!</h3>
              <p className="text-muted-foreground">
                O pagamento da NF-e {invoice.invoice_number} foi registrado com sucesso.
              </p>
            </div>
            <Button asChild>
              <a href={`/dashboard/invoices/${invoice.id}`}>Ver Nota Fiscal</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Informações do Pagamento
          </CardTitle>
          <CardDescription>Registre os detalhes do pagamento recebido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>NF-e {invoice.invoice_number}</strong>
              {invoice.clients && ` - ${invoice.clients.name}`}
              <br />
              Valor total: {formatCurrency(invoice.total_amount)}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Data do Pagamento *</Label>
              <Input
                id="payment_date"
                type="date"
                required
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount_paid">Valor Pago *</Label>
            <Input
              id="amount_paid"
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.amount_paid}
              onChange={(e) => setFormData({ ...formData, amount_paid: Number.parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">Valor original: {formatCurrency(invoice.total_amount)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre o pagamento (opcional)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor da NF-e:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor a ser pago:</span>
              <span className="font-medium">{formatCurrency(formData.amount_paid)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Saldo restante:</span>
              <span
                className={invoice.total_amount - formData.amount_paid === 0 ? "text-green-600" : "text-yellow-600"}
              >
                {formatCurrency(invoice.total_amount - formData.amount_paid)}
              </span>
            </div>
          </div>

          {formData.amount_paid !== invoice.total_amount && (
            <Alert>
              <AlertDescription>
                {formData.amount_paid > invoice.total_amount
                  ? "O valor pago é maior que o valor da nota fiscal."
                  : "Este será registrado como um pagamento parcial. O status da fatura será alterado para 'Parcial'."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrar Pagamento"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
