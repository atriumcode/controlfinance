import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("[v0] API /api/import-history - Buscando histórico")

    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const invoices = await query(
      `SELECT 
        i.id,
        i.invoice_number,
        i.issue_date,
        i.total_amount,
        i.status,
        i.created_at,
        json_build_object('name', c.name) as client
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.company_id = $1
       ORDER BY i.created_at DESC
       LIMIT 20`,
      [user.company_id],
    )

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[v0] Erro ao buscar histórico:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar histórico",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
