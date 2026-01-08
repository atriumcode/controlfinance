"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { InvoiceStats } from "@/components/invoices/invoice-stats"
import { InvoicesGroupedList } from "@/components/invoices/invoices-grouped-list"
import { InvoicesEmpty } from "@/components/invoices/invoices-empty"


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

import { deleteInvoice } from "@/lib/actions/invoice-actions"
import { useToast } from "@/hooks/use-toast"

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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] =
    useState<{ id: string; number: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  /* =========================
     FETCH
  ========================= */

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (!res.ok) {
        router.push("/auth/login")
        return
      }

      const profile = await res.json()
      if (!profile.company_id) {
        router.push("/dashboard/settings")
        return
      }

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          total_amount,
          amount_paid,
          status,
          issue_date,
          due_date,
          clients (
            name,
            document,
            document_type,
            city,
            state
          )
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })
        .limit(200)

      if (error) throw error

      setInvoices(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  /* =========================
     DELETE
  ========================= */

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return

    setIsDeleting(true)
    const result = await deleteInvoice(invoiceToDelete.id)

    if (result.success) {
      toast({ title: "Nota fiscal excluída com sucesso" })
      fetchInvoices()
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setInvoiceToDelete(null)
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notas Fiscais"
        description="Gerencie suas notas fiscais eletrônicas agrupadas por cidade e cliente"
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
          onRequestDelete={(id, number) => {
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
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
