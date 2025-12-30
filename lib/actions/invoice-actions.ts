"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function deleteInvoice(invoiceId: string) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return { success: false, error: "Não autenticado" }
    }

    if (!user.company_id) {
      return { success: false, error: "Empresa não encontrada" }
    }

    const supabase = await createClient()

    // Verify the invoice belongs to the user's company
    const { data: invoice, error: invoiceError } = await supabase
    //corrigido de invoices para invoices_dashboard
      .from("invoices")
      .select("id, company_id")
      .eq("id", invoiceId)
      .eq("company_id", user.company_id)
      .single()

    if (invoiceError || !invoice) {
      return { success: false, error: "Nota fiscal não encontrada" }
    }

    // Delete associated payments first (foreign key constraint)
    const { error: paymentsError } = await supabase.from("payments").delete().eq("invoice_id", invoiceId)

    if (paymentsError) {
      console.error("[v0] Error deleting payments:", paymentsError)
      return { success: false, error: "Erro ao excluir pagamentos associados" }
    }

    // Delete associated invoice items (foreign key constraint)
    const { error: itemsError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId)

    if (itemsError) {
      console.error("[v0] Error deleting invoice items:", itemsError)
      return { success: false, error: "Erro ao excluir itens da nota fiscal" }
    }

    // Finally, delete the invoice
    const { error: deleteError } = await supabase.from("invoices").delete().eq("id", invoiceId)

    if (deleteError) {
      console.error("[v0] Error deleting invoice:", deleteError)
      return { success: false, error: "Erro ao excluir nota fiscal" }
    }

    // Revalidate the invoices page to refresh the data
    revalidatePath("/dashboard/invoices")

    return { success: true }
  } catch (error) {
    console.error("[v0] Unexpected error deleting invoice:", error)
    return { success: false, error: "Erro inesperado ao excluir nota fiscal" }
  }
}
