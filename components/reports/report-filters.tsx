"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Client {
  id: string
  name: string
  city: string
  state: string
  document: string
}

interface Invoice {
  id: string
  total_amount: number
  amount_paid: number | null
  status: string
  issue_date: string
  created_at: string
  client_id: string
  clients?: {
    name: string
    city: string
    state: string
  }
}

interface ReportFiltersProps {
  invoices: Invoice[]
  clients: Client[]
  onFilterChange: (filteredInvoices: Invoice[]) => void
}

export function ReportFilters({ invoices, clients, onFilterChange }: ReportFiltersProps) {
  const [paymentStatus, setPaymentStatus] = useState<string>("all")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<string>("all")

  // Get unique cities from clients
  const cities = useMemo(() => {
    const citySet = new Set<string>()
    clients.forEach((client) => {
      if (client.city && client.state) {
        citySet.add(`${client.city}, ${client.state}`)
      }
    })
    return Array.from(citySet).sort()
  }, [clients])

  // Filter invoices based on selected filters
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices]

    // Filter by payment status
    if (paymentStatus !== "all") {
      filtered = filtered.filter((invoice) => {
        const amountPaid = invoice.amount_paid || 0
        const totalAmount = invoice.total_amount || 0

        switch (paymentStatus) {
          case "paid":
            return amountPaid >= totalAmount && totalAmount > 0
          case "pending":
            return amountPaid === 0
          case "partial":
            return amountPaid > 0 && amountPaid < totalAmount
          default:
            return true
        }
      })
    }

    // Filter by city
    if (selectedCity !== "all") {
      filtered = filtered.filter((invoice) => {
        if (!invoice.clients?.city || !invoice.clients?.state) return false
        return `${invoice.clients.city}, ${invoice.clients.state}` === selectedCity
      })
    }

    // Filter by client
    if (selectedClient !== "all") {
      filtered = filtered.filter((invoice) => invoice.client_id === selectedClient)
    }

    return filtered
  }, [invoices, paymentStatus, selectedCity, selectedClient])

  // Update parent component when filters change
  useMemo(() => {
    onFilterChange(filteredInvoices)
  }, [filteredInvoices, onFilterChange])

  const hasActiveFilters = paymentStatus !== "all" || selectedCity !== "all" || selectedClient !== "all"

  const clearFilters = () => {
    setPaymentStatus("all")
    setSelectedCity("all")
    setSelectedClient("all")
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Payment Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="payment-status">Status de Pagamento</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger id="payment-status">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="pending">A Receber</SelectItem>
                <SelectItem value="partial">Parcialmente Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label htmlFor="city">Município</Label>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Filter */}
          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredInvoices.length} de {invoices.length} notas fiscais
          </div>
        )}
      </CardContent>
    </Card>
  )
}
