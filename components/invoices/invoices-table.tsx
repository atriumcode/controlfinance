"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Invoice {
  id: string
  invoice_number: string
  nfe_key?: string
  issue_date: string
  due_date?: string
  total_amount: number
  status: string
  created_at: string
  clients?: {
    name: string
    document: string
    document_type: "cpf" | "cnpj"
    city?: string
    state?: string
  } | null
}

interface InvoicesTableProps {
  invoices: Invoice[]
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const groupedInvoices = invoices.reduce(
    (groups, invoice) => {
      const clientKey = invoice.clients?.document || "sem-cliente"
      if (!groups[clientKey]) {
        groups[clientKey] = {
          client: invoice.clients,
          invoices: [],
        }
      }
      groups[clientKey].invoices.push(invoice)
      return groups
    },
    {} as Record<string, { client: Invoice["clients"]; invoices: Invoice[] }>,
  )

  const filteredGroups = Object.entries(groupedInvoices).filter(([_, group]) => {
    const hasMatchingInvoice = group.invoices.some((invoice) => {
      const matchesSearch =
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.nfe_key?.includes(searchTerm)

      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    })

    return hasMatchingInvoice
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "Parcial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago"
      case "pending":
        return "Pendente"
      case "overdue":
        return "Vencido"
      case "cancelled":
        return "Cancelado"
      case "Parcial":
        return "Parcial"
      default:
        return status
    }
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma nota fiscal cadastrada ainda.</p>
        <Button asChild className="mt-4">
          <Link href="/invoices/new">Criar Primeira Nota Fiscal</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notas fiscais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
            <SelectItem value="Parcial">Parcial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filteredGroups.map(([clientKey, group]) => (
          <div key={clientKey} className="space-y-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-lg">{group.client?.name || "Cliente não identificado"}</h3>
              {group.client?.city && (
                <Badge variant="outline" className="text-xs">
                  {group.client.city}
                  {group.client.state ? `, ${group.client.state}` : ""}
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs ml-auto">
                {group.invoices.length} NF-e{group.invoices.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data Emissão</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.invoices
                    .filter((invoice) => {
                      const matchesSearch =
                        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.clients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        invoice.nfe_key?.includes(searchTerm)
                      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
                      return matchesSearch && matchesStatus
                    })
                    .map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{invoice.invoice_number}</p>
                            {invoice.nfe_key && <p className="text-xs text-muted-foreground">NF-e</p>}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                        <TableCell>{invoice.due_date ? formatDate(invoice.due_date) : "-"}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.total_amount)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invoice.status)}>{getStatusLabel(invoice.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoices/${invoice.id}`}>Ver Detalhes</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoices/${invoice.id}/edit`}>Editar</Link>
                              </DropdownMenuItem>
                              {(invoice.status === "pending" ||
                                invoice.status === "overdue" ||
                                invoice.status === "Parcial") && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/invoices/${invoice.id}/payment`}>Registrar Pagamento</Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && searchTerm && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Nenhuma nota fiscal encontrada para "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
