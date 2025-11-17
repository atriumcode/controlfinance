"use server"

import { execute, query } from "@/lib/db/postgres"
import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function deleteInvoice(invoiceId: string) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return { success: false, error: "Não autenticado" }

    const invoice = await query(
      "SELECT id FROM invoices WHERE id = $1 AND company_id = $2 LIMIT 1",
      [invoiceId, user.company_id]
    )

    if (!invoice || invoice.length === 0) {
      return { success: false, error: "Nota fiscal não encontrada" }
    }

    await execute("DELETE FROM invoices WHERE id = $1", [invoiceId])

    revalidatePath("/dashboard/invoices")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error deleting invoice:", error)
    return { success: false, error: "Erro ao excluir nota fiscal" }
  }
}
