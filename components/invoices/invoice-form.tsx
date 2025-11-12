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
import { Plus, Trash2 } from "lucide-react"

interface Client {
  id: string
  name: string
  document: string
  document_type: "cpf" | "cnpj"
}

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total_price: number
}

interface InvoiceFormProps {
  clients: Client[]
  invoice?: {
    id: string
    invoice_number: string
    client_id?: string
    issue_date: string
    due_date?: string
    total_amount: number
    tax_amount: number
    discount_amount: number
    net_amount: number
    status: string
    notes?: string
    invoice_items?: InvoiceItem[]
  }
}

export function InvoiceForm({ clients, invoice }: InvoiceFormProps) {
  const [formData, setFormData] = useState({
    invoice_number: invoice?.invoice_number || "",
    client_id: invoice?.client_id || "default_client_id", // Updated default value
    issue_date: invoice?.issue_date || new Date().toISOString().split("T")[0],
    due_date: invoice?.due_date || "",
    tax_amount: invoice?.tax_amount || 0,
    discount_amount: invoice?.discount_amount || 0,
    notes: invoice?.notes || "",
  })

  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.invoice_items || [
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ],
  )

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...items]
    newItems[index].quantity = quantity
    newItems[index].unit_price = unitPrice
    newItems[index].total_price = quantity * unitPrice
    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0)
    const totalAmount = subtotal + formData.tax_amount - formData.discount_amount
    return {
      subtotal,
      totalAmount,
      netAmount: totalAmount,
    }
  }

  const { subtotal, totalAmount } = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (items.some((item) => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
      setError("Todos os itens devem ter descrição, quantidade maior que zero e preço válido")
      setIsLoading(false)
      return
    }

    try {
      const invoiceData = {
        ...formData,
        client_id: formData.client_id || null,
        total_amount: totalAmount,
        net_amount: totalAmount,
        status: "pending",
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      }

      const url = invoice ? `/api/invoices/${invoice.id}` : "/api/invoices"
      const method = invoice ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao salvar nota fiscal")
      }

      router.push("/dashboard/invoices")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao salvar nota fiscal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{invoice ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}</CardTitle>
          <CardDescription>
            {invoice ? "Atualize as informações da nota fiscal" : "Preencha os dados da nova nota fiscal"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Número da Nota Fiscal *</Label>
              <Input
                id="invoice_number"
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default_client_id">Nenhum cliente</SelectItem> {/* Updated value */}
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.document}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue_date">Data de Emissão *</Label>
              <Input
                id="issue_date"
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais sobre a nota fiscal"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Itens da Nota Fiscal</CardTitle>
              <CardDescription>Adicione os produtos ou serviços</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Item {index + 1}</h4>
                {items.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Descrição *</Label>
                  <Input
                    required
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...items]
                      newItems[index].description = e.target.value
                      setItems(newItems)
                    }}
                    placeholder="Descrição do produto/serviço"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="0.001"
                    step="0.001"
                    required
                    value={item.quantity}
                    onChange={(e) => {
                      const quantity = Number.parseFloat(e.target.value) || 0
                      updateItemTotal(index, quantity, item.unit_price)
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preço Unitário *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={item.unit_price}
                    onChange={(e) => {
                      const unitPrice = Number.parseFloat(e.target.value) || 0
                      updateItemTotal(index, item.quantity, unitPrice)
                    }}
                  />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Total do Item: <span className="font-medium">R$ {item.total_price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tax_amount">Impostos</Label>
              <Input
                id="tax_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_amount">Desconto</Label>
              <Input
                id="discount_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount_amount}
                onChange={(e) => setFormData({ ...formData, discount_amount: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impostos:</span>
              <span>R$ {formData.tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Desconto:</span>
              <span>- R$ {formData.discount_amount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : invoice ? "Atualizar" : "Salvar"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/invoices")}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
