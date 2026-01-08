"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { requireAuthSafe } from "@/lib/auth/require-auth-safe"

/* =========================
   LIST INVOICES
========================= */

export async function listInvoices() {
  const user = await requireAuthSafe()

  if (!user || !user.company_id) {
    return {
      success: false,
      error: "NOT_AUTHENTICATED",
      data: [],
    }
  }

  const supabase = createAdminClient()

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
      created_at,
      clients (
        name,
        document,
        document_type,
        city,
        state
      )
    `)
    .eq("company_id", user.company_id)
    .order("created_at", { ascending: false })
    .limit(200)

  if (error) {
    console.error(error)
    return {
      success: false,
      error: "QUERY_ERROR",
      data: [],
    }
  }

  return {
    success: true,
    data: data ?? [],
  }
}

/* =========================
   DELETE INVOICE
========================= */

export async function deleteInvoice(invoiceId: string) {
  const user = await requireAuthSafe()

  if (!user || !user.company_id) {
    return {
      success: false,
      error: "NOT_AUTHENTICATED",
    }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("company_id", user.company_id)

  if (error) {
    console.error(error)
    return {
      success: false,
      error: "DELETE_ERROR",
    }
  }

  return {
    success: true,
  }
}
