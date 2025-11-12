"use server"

import { query, execute } from "@/lib/db/postgres"
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

    const invoices = await query("SELECT id, company_id FROM invoices WHERE id = $1 AND company_id = $2 LIMIT 1", [
      invoiceId,
      user.company_id,
    ])

    const invoice = invoices && invoices.length > 0 ? invoices[0] : null

    if (!invoice) {
      return { success: false, error: "Nota fiscal não encontrada" }
    }

    await execute("DELETE FROM payments WHERE invoice_id = $1", [invoiceId])
    await execute("DELETE FROM invoice_items WHERE invoice_id = $1", [invoiceId])
    await execute("DELETE FROM invoices WHERE id = $1", [invoiceId])

    revalidatePath("/dashboard/invoices")

    return { success: true }
  } catch (error) {
    console.error("[v0] Unexpected error deleting invoice:", error)
    return { success: false, error: "Erro inesperado ao excluir nota fiscal" }
  }
}
