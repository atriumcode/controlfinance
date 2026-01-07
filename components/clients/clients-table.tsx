"use client"

import Link from "next/link"
import { Client } from "@/app/dashboard/clients/page"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil } from "lucide-react"

interface ClientsTableProps {
  clients: Client[]
  onRefresh?: () => void
}

export function ClientsTable({ clients }: ClientsTableProps) {
  if (!clients.length) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        Nenhum cliente cadastrado
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">
                {client.name}
              </TableCell>

              <TableCell>
                <Badge variant="outline">
                  {client.document_type}
                </Badge>{" "}
                {client.document}
              </TableCell>

              <TableCell>
                {client.city && client.state
                  ? `${client.city}/${client.state}`
                  : "-"}
              </TableCell>

              <TableCell>
                {client.email || client.phone || "-"}
              </TableCell>

              <TableCell className="text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  asChild
                >
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
