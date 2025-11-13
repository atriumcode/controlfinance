import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db/postgres"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cpf_cnpj, email, phone, address, city, state, zip_code } = body

    console.log("[v0] Creating client with data:", { name, cpf_cnpj, company_id: user.company_id })

    const result = await query(
      `INSERT INTO clients (company_id, name, cpf_cnpj, email, phone, address, city, state, zip_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        user.company_id,
        name,
        cpf_cnpj,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        zip_code || null,
      ],
    )

    console.log("[v0] Client created successfully:", result.rows[0].id)

    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error("[v0] Error creating client:", error)
    return NextResponse.json({ error: "Erro ao criar cliente", details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const result = await query(`SELECT * FROM clients WHERE company_id = $1 ORDER BY created_at DESC`, [
      user.company_id,
    ])

    return NextResponse.json(result.rows)
  } catch (error: any) {
    console.error("[v0] Error fetching clients:", error)
    return NextResponse.json({ error: "Erro ao buscar clientes", details: error.message }, { status: 500 })
  }
}
