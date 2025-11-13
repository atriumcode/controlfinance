import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    console.log("[v0] API /api/import-history - Buscando histórico")

    const user = await getCurrentUser()
    if (!user) {
      console.log("[v0] Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Buscar últimas 20 NF-e importadas
    const invoices = await query(
      `SELECT 
        i.id,
        i.invoice_number,
        i.nfe_key,
        i.issue_date,
        i.total_amount,
        i.status,
        i.created_at,
        json_build_object('name', c.name) as clients
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC
       LIMIT 20`,
      [user.id],
    )

    console.log("[v0] Encontradas", invoices.length, "NF-e importadas")

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
