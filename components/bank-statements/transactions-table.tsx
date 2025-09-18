"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download } from "lucide-react"
import { format } from "date-fns"
import type { OFXTransaction } from "@/lib/utils/ofx-parser"

interface TransactionsTableProps {
  transactions: OFXTransaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Type filter
      if (typeFilter !== "all" && transaction.type !== typeFilter) {
        return false
      }

      // Date range filter
      const transactionDate = new Date(transaction.date)
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        transactionDate.setHours(0, 0, 0, 0)
        if (transactionDate < fromDate) {
          return false
        }
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        transactionDate.setHours(0, 0, 0, 0)
        if (transactionDate > toDate) {
          return false
        }
      }

      // Amount range filter
      if (minAmount && transaction.amount < Number.parseFloat(minAmount)) {
        return false
      }
      if (maxAmount && transaction.amount > Number.parseFloat(maxAmount)) {
        return false
      }

      return true
    })
  }, [transactions, searchTerm, typeFilter, dateFrom, dateTo, minAmount, maxAmount])

  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setDateFrom("")
    setDateTo("")
    setMinAmount("")
    setMaxAmount("")
  }

  const exportToCSV = () => {
    const headers = ["Data", "Descrição", "Valor", "Tipo"]
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((t) =>
        [
          new Date(t.date).toLocaleDateString("pt-BR"),
          `"${t.description}"`,
          t.amount.toFixed(2),
          t.type === "entrada" ? "Entrada" : "Saída",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transacoes_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalEntradas = filteredTransactions.filter((t) => t.type === "entrada").reduce((sum, t) => sum + t.amount, 0)

  const totalSaidas = filteredTransactions.filter((t) => t.type === "saida").reduce((sum, t) => sum + t.amount, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              {filteredTransactions.length} de {transactions.length} transações
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entradas</SelectItem>
                <SelectItem value="saida">Saídas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Mínimo</label>
            <Input type="number" placeholder="0.00" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Máximo</label>
            <Input type="number" placeholder="0.00" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Resumo dos filtros */}
        {filteredTransactions.length !== transactions.length && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Total Entradas (filtrado)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Total Saídas (filtrado)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div
                  className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Saldo (filtrado)</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabela */}
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Data</th>
                  <th className="text-left p-3 font-medium">Descrição</th>
                  <th className="text-right p-3 font-medium">Valor</th>
                  <th className="text-center p-3 font-medium">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">
                      Nenhuma transação encontrada com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 whitespace-nowrap">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-3">
                        <div className="min-w-0 break-words" title={transaction.description}>
                          {transaction.description}
                        </div>
                      </td>
                      <td
                        className={`p-3 text-right font-medium whitespace-nowrap ${
                          transaction.type === "entrada" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "entrada" ? "+" : "-"}R${" "}
                        {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={transaction.type === "entrada" ? "default" : "destructive"}>
                          {transaction.type === "entrada" ? "Entrada" : "Saída"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
