"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"

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

interface ClientsTableProps {
  clients: Client[]
  onRefresh?: () => void
}

export function ClientsTable({ clients }: ClientsTableProps) {
  /* =========================
     EMPTY STATE (segurança extra)
  ========================= */
  if (!clients.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground animate-in fade-in duration-300">
        Nenhum cliente cadastrado
      </div>
    )
  }

  /* =========================
     TABLE
  ========================= */
  return (
    <div className="rounded-lg border animate-in fade-in duration-300">
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
            <TableRow
              key={client.id}
              className="
                transition-colors
                hover:bg-muted/50
              "
            >
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
                  className="transition-transform hover:scale-105"
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
