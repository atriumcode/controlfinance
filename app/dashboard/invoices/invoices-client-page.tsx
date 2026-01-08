"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { InvoicesGroupedList } from "@/components/invoices/invoices-grouped-list"
import { InvoicesEmpty } from "@/components/invoices/invoices-empty"
import { useToast } from "@/hooks/use-toast"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { listInvoices, deleteInvoice } from "@/lib/actions/invoice-actions"

/* =========================
   TYPES
========================= */

export interface Invoice {
  id: string
  invoice_number: string
  total_amount: number | string | null
  amount_paid: number | string | null
  status: string
  issue_date: string
  due_date: string
  clients: {
    name: string
    document: string
    document_type: string
    city: string
    state: string
  } | null
}

/* =========================
   PAGE
========================= */

export default function InvoicesClientPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<{ id: string; number: string } | null>(null)

  const { toast } = useToast()

  /* =========================
     FETCH (SERVER ACTION)
  ========================= */

  useEffect(() => {
    startTransition(async () => {
      const result = await listInvoices()

      if (!result.success) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
        setInvoices([])
      } else {
        setInvoices(result.data || [])
      }

      setLoading(false)
    })
  }, [toast])

  /* =========================
     DELETE
  ========================= */

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return

    const result = await deleteInvoice(invoiceToDelete.id)

    if (result.success) {
      toast({ title: "Nota fiscal excluída com sucesso" })
      const refreshed = await listInvoices()
      setInvoices(refreshed.data || [])
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      })
    }

    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  if (loading || isPending) {
    return <div className="p-8">Carregando...</div>
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas Fiscais"
        description="Gerencie suas notas fiscais eletrônicas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/import">Importar XML</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/invoices/new">Nova Nota Fiscal</Link>
            </Button>
          </>
        }
      />

      <InvoiceStats invoices={invoices} />

      {invoices.length === 0 ? (
        <InvoicesEmpty />
      ) : (
        <InvoicesGroupedList
          invoices={invoices}
          onDelete={(id, number) => {
            setInvoiceToDelete({ id, number })
            setDeleteDialogOpen(true)
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a nota fiscal{" "}
              {invoiceToDelete?.number}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
