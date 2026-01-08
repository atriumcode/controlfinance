"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Invoice {
  id: string
  total_amount: number
  status: string
  clients?: {
    name: string
    document: string
    document_type: "cpf" | "cnpj"
  } | null
}

interface Client {
  id: string
  name: string
  document: string
  document_type: "cpf" | "cnpj"
}

interface ClientsReportProps {
  invoices: Invoice[]
  clients: Client[]
}

export function ClientsReport({ invoices, clients }: ClientsReportProps) {
  // Calculate client statistics
  const clientStats = clients
    .map((client) => {
      const clientInvoices = invoices.filter((invoice) => invoice.clients?.document === client.document)

      const totalAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
      const paidAmount = clientInvoices
        .filter((invoice) => invoice.status === "paid")
        .reduce((sum, invoice) => sum + invoice.total_amount, 0)
      const pendingAmount = totalAmount - paidAmount

      return {
        ...client,
        invoiceCount: clientInvoices.length,
        totalAmount,
        paidAmount,
        pendingAmount,
      }
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const topClients = clientStats.slice(0, 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Clientes</CardTitle>
        <CardDescription>Clientes com maior faturamento</CardDescription>
      </CardHeader>
      <CardContent>
        {topClients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhum cliente com faturamento encontrado</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">NF-e</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {client.document_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{client.invoiceCount}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(client.totalAmount)}</TableCell>
                    <TableCell className="text-right text-green-600">{formatCurrency(client.paidAmount)}</TableCell>
                    <TableCell className="text-right text-yellow-600">{formatCurrency(client.pendingAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
