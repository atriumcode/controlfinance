"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X, FileDown } from "lucide-react"
import { generateReportPDF } from "@/lib/pdf/generate-report-pdf"

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
  const [groupBy, setGroupBy] = useState<"client" | "city">("client")

  const cities = useMemo(() => {
    const citySet = new Set<string>()
    clients.forEach((client) => {
      if (client.city && client.state) {
        citySet.add(`${client.city}, ${client.state}`)
      }
    })
    return Array.from(citySet).sort()
  }, [clients])

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices]

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

    if (selectedCity !== "all") {
      filtered = filtered.filter((invoice) => {
        if (!invoice.clients?.city || !invoice.clients?.state) return false
        return `${invoice.clients.city}, ${invoice.clients.state}` === selectedCity
      })
    }

    if (selectedClient !== "all") {
      filtered = filtered.filter((invoice) => invoice.client_id === selectedClient)
    }

    return filtered
  }, [invoices, paymentStatus, selectedCity, selectedClient])

  useMemo(() => {
    onFilterChange(filteredInvoices)
  }, [filteredInvoices, onFilterChange])

  const hasActiveFilters = paymentStatus !== "all" || selectedCity !== "all" || selectedClient !== "all"

  const clearFilters = () => {
    setPaymentStatus("all")
    setSelectedCity("all")
    setSelectedClient("all")
  }

  const handleGeneratePDF = async () => {
    const userEmail = document.querySelector("[data-user-email]")?.getAttribute("data-user-email") || "N/A"
    const userName = document.querySelector("[data-user-name]")?.getAttribute("data-user-name") || "N/A"
    const companyName =
      document.querySelector("[data-company-name]")?.getAttribute("data-company-name") || "COPYCENTER LTDA"
    const companyCnpj = document.querySelector("[data-company-cnpj]")?.getAttribute("data-company-cnpj") || "N/A"
    const companyAddress = document.querySelector("[data-company-address]")?.getAttribute("data-company-address") || ""
    const companyCity = document.querySelector("[data-company-city]")?.getAttribute("data-company-city") || ""
    const companyState = document.querySelector("[data-company-state]")?.getAttribute("data-company-state") || ""
    const companyLogo = document.querySelector("[data-company-logo]")?.getAttribute("data-company-logo") || ""

    generateReportPDF({
      invoices: filteredInvoices,
      clients,
      groupBy,
      paymentStatus,
      selectedCity,
      selectedClient,
      userEmail,
      userName,
      companyName,
      companyCnpj,
      companyAddress,
      companyCity,
      companyState,
      companyLogo,
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros</h3>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
            <Button onClick={handleGeneratePDF} size="sm">
              <FileDown className="h-4 w-4 mr-1" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
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

          <div className="space-y-2">
            <Label htmlFor="group-by">Agrupar Por</Label>
            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as "client" | "city")}>
              <SelectTrigger id="group-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="city">Cidade</SelectItem>
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
