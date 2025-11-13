import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"

export async function GET() {
  try {
    // Verificar colunas da tabela clients
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `)

    return NextResponse.json({
      success: true,
      columns: result,
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
