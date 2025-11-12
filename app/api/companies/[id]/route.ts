import { NextResponse } from "next/server"
import { execute, query } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth/server-auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] PUT /api/companies/[id] - Starting")
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[v0] Update request body:", body)

    const { name, cnpj, email, phone, address, city, state, zip_code, logo_url } = body

    // Validate required fields
    if (!name || !cnpj || !email) {
      return NextResponse.json({ error: "Nome, CNPJ e email são obrigatórios" }, { status: 400 })
    }

    await execute(
      `UPDATE companies 
       SET name = $1, cnpj = $2, email = $3, phone = $4, address = $5, 
           city = $6, state = $7, zip_code = $8, logo_url = $9, updated_at = NOW()
       WHERE id = $10`,
      [
        name,
        cnpj,
        email,
        phone || "",
        address || "",
        city || "",
        state || "",
        zip_code || "",
        logo_url || "",
        params.id,
      ],
    )

    const rows = await query("SELECT * FROM companies WHERE id = $1", [params.id])
    console.log("[v0] Company updated:", rows[0]?.id)

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("[v0] Error updating company:", error)
    return NextResponse.json({ error: "Erro ao atualizar empresa" }, { status: 500 })
  }
}
