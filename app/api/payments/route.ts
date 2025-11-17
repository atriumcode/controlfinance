import { NextRequest, NextResponse } from "next/server"
import { execute } from "@/lib/db/helpers"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await request.json()
    const { invoice_id, amount, payment_date, payment_method, notes } = data

    if (!invoice_id || !amount || !payment_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await execute(
      `
      INSERT INTO payments (invoice_id, amount, payment_date, payment_method, notes)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [invoice_id, amount, payment_date, payment_method || "N/A", notes || null]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error creating payment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
