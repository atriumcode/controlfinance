import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db/postgres"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cpf_cnpj, email, phone, address, city, state, zip_code } = body

    console.log("[v0] Updating client:", params.id)

    const result = await query(
      `UPDATE clients 
       SET name = $1, cpf_cnpj = $2, email = $3, phone = $4, address = $5, city = $6, state = $7, zip_code = $8, updated_at = NOW()
       WHERE id = $9 AND company_id = $10
       RETURNING *`,
      [
        name,
        cpf_cnpj,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        zip_code || null,
        params.id,
        user.company_id,
      ],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    console.log("[v0] Client updated successfully")

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("[v0] Error updating client:", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente", details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    console.log("[v0] Deleting client:", params.id)

    const result = await query(`DELETE FROM clients WHERE id = $1 AND company_id = $2 RETURNING id`, [
      params.id,
      user.company_id,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    console.log("[v0] Client deleted successfully")

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting client:", error)
    return NextResponse.json({ error: "Erro ao deletar cliente", details: error.message }, { status: 500 })
  }
}
