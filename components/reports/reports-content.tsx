"use client"

import { useState } from "react"
import { ReportFilters } from "./report-filters"
import { ReportsOverview } from "./reports-overview"
import { MonthlyReport } from "./monthly-report"
import { ClientsReport } from "./clients-report"
import { PaymentMethodsReport } from "./payment-methods-report"

interface Client {
  id: string
  name: string
  city: string
  state: string
  document: string
  created_at: string
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
    document: string
    document_type: string
  }
}

interface ReportsContentProps {
  initialInvoices: Invoice[]
  clients: Client[]
}

export function ReportsContent({ initialInvoices, clients }: ReportsContentProps) {
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(initialInvoices)

  return (
    <div className="space-y-6">
      <ReportFilters invoices={initialInvoices} clients={clients} onFilterChange={setFilteredInvoices} />

      <ReportsOverview invoices={filteredInvoices} clients={clients} />

      <div className="grid gap-6 lg:grid-cols-2">
        <MonthlyReport invoices={filteredInvoices} />
        <PaymentMethodsReport invoices={filteredInvoices} />
      </div>

      <ClientsReport invoices={filteredInvoices} clients={clients} />
    </div>
  )
}
