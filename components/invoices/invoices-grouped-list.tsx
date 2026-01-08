"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronDown,
  FileText,
  MapPin,
  Trash2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import type { Invoice } from "@/app/dashboard/invoices/page"

interface Props {
  invoices: Invoice[]
  onDelete: (id: string, number: string) => void
}

export function InvoicesGroupedList({ invoices, onDelete }: Props) {
  /* =========================
     STATES
  ========================= */
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set())
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  /* =========================
     GROUP DATA
  ========================= */
  const cityGroups = invoices.reduce((groups: any[], invoice) => {
    const cityKey = invoice.clients
      ? `${invoice.clients.city}, ${invoice.clients.state}`
      : "Cidade não informada"

    let cityGroup = groups.find((g) => g.key === cityKey)

    if (!cityGroup) {
      cityGroup = {
        key: cityKey,
        clientGroups: [],
      }
      groups.push(cityGroup)
    }

    if (!invoice.clients) return groups

    let clientGroup = cityGroup.clientGroups.find(
      (g: any) => g.client.document === invoice.clients!.document
    )

    if (!clientGroup) {
      clientGroup = {
        client: invoice.clients,
        invoices: [],
      }
      cityGroup.clientGroups.push(clientGroup)
    }

    clientGroup.invoices.push(invoice)

    return groups
  }, [])

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">
      {cityGroups.map((cityGroup) => {
        const cityKey = cityGroup.key
        const cityExpanded = expandedCities.has(cityKey)

        return (
          <div key={cityKey} className="space-y-2">
            {/* CIDADE */}
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  const next = new Set(expandedCities)
                  cityExpanded ? next.delete(cityKey) : next.add(cityKey)
                  setExpandedCities(next)
                }}
              >
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ChevronDown
                    className={`
                      h-4 w-4 transition-transform duration-200
                      ${cityExpanded ? "rotate-180" : ""}
                    `}
                  />
                  <MapPin className="h-4 w-4 text-primary" />
                  {cityKey}
                </CardTitle>
              </CardHeader>
            </Card>

            {/* CLIENTES (ANIMADO) */}
            <div
              className={`
                ml-6 space-y-4 overflow-hidden transition-all duration-300 ease-out
                ${cityExpanded
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0"}
              `}
            >
              {cityGroup.clientGroups.map((group: any) => {
                const clientKey = group.client.document
                const clientExpanded = expandedClients.has(clientKey)

                return (
                  <Card key={clientKey}>
                    <CardHeader
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        const next = new Set(expandedClients)
                        clientExpanded
                          ? next.delete(clientKey)
                          : next.add(clientKey)
                        setExpandedClients(next)
                      }}
                    >
                      <CardTitle className="flex items-center gap-2 text-base">
                        <ChevronDown
                          className={`
                            h-4 w-4 transition-transform duration-200
                            ${clientExpanded ? "rotate-180" : ""}
                          `}
                        />
                        {group.client.name}
                      </CardTitle>
                    </CardHeader>

                    {/* NOTAS (ANIMADO) */}
                    <CardContent
                      className={`
                        space-y-3 overflow-hidden transition-all duration-300 ease-out
                        ${clientExpanded
                          ? "max-h-[800px] opacity-100"
                          : "max-h-0 opacity-0"}
                      `}
                    >
                      {group.invoices.map((invoice: Invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="flex items-center gap-3"
                          >
                            <FileText className="h-4 w-4" />
                            NF-e {invoice.invoice_number}
                          </Link>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {invoice.status}
                            </Badge>

                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() =>
                                onDelete(invoice.id, invoice.invoice_number)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
