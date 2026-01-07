"use client"

import { InvoiceStats } from "@/components/invoices/invoice-stats"
// … outros imports necessários

export function InvoicesGroupedList({
  invoices,
  onDelete,
}: {
  invoices: Invoice[]
  onDelete: (id: string, number: string) => void
}) {
  // TODO: mover aqui:
  // - cityGroups
  // - expandedCities
  // - expandedClients
  // - render dos cards
}
