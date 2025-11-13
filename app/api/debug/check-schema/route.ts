import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function GET() {
  try {
    const tables = ["clients", "invoices", "companies", "payments", "users"]
    const schemas: Record<string, any[]> = {}

    for (const table of tables) {
      const result = await query(
        `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `,
        [table],
      )

      schemas[table] = result
    }

    return NextResponse.json({
      success: true,
      schemas,
    })
  } catch (error: any) {
    console.error("[v0] Erro ao verificar schema:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
