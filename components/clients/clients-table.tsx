"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCPF, formatCNPJ } from "@/lib/utils/document-validation"

interface Client {
  id: string
  name: string
  document: string
  document_type: "cpf" | "cnpj"
  email?: string
  phone?: string
  city?: string
  state?: string
  created_at: string
}

interface ClientsTableProps {
  clients: Client[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm) ||
      client.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDocument = (document: string, type: "cpf" | "cnpj") => {
    return type === "cpf" ? formatCPF(document) : formatCNPJ(document)
  }

  const handleClientClick = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`)
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/clients/new">Cadastrar Primeiro Cliente</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleClientClick(client.id)}
              >
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {client.document_type.toUpperCase()}
                    </Badge>
                    {formatDocument(client.document, client.document_type)}
                  </div>
                </TableCell>
                <TableCell>
                  {client.city && client.state ? `${client.city}, ${client.state}` : client.city || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredClients.length === 0 && searchTerm && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Nenhum cliente encontrado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
