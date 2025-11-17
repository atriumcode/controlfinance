"use server"

import { execute } from "@/lib/db/postgres"
import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function registerPayment(data: any) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return { success: false, error: "Não autenticado" }

    const { invoice_id, amount, payment_date, payment_method, notes } = data

    await execute(
      `INSERT INTO payments (invoice_id, amount, payment_date, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [invoice_id, amount, payment_date, payment_method || "N/A", notes || null]
    )

    revalidatePath(`/dashboard/invoices/${invoice_id}`)
    return { success: true }
  } catch (error) {
    console.error("Payment error:", error)
    return { success: false, error: "Erro ao registrar pagamento" }
  }
}
