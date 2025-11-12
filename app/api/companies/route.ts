import { NextResponse } from "next/server"
import { query, execute } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth/server-auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cnpj, email, phone, address, city, state, zip_code, logo_url } = body

    // Validate required fields
    if (!name || !cnpj || !email) {
      return NextResponse.json({ error: "Nome, CNPJ e email são obrigatórios" }, { status: 400 })
    }

    // Insert company
    const result = await query(
      `INSERT INTO companies (name, cnpj, email, phone, address, city, state, zip_code, logo_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [name, cnpj, email, phone || "", address || "", city || "", state || "", zip_code || "", logo_url || ""],
    )

    const company = result.rows[0]

    // Update user profile with company_id
    await execute("UPDATE profiles SET company_id = $1, updated_at = NOW() WHERE id = $2", [company.id, user.id])

    return NextResponse.json(company)
  } catch (error) {
    console.error("[v0] Error creating company:", error)
    return NextResponse.json({ error: "Erro ao criar empresa" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!user.company_id) {
      return NextResponse.json({ company: null })
    }

    const result = await query("SELECT * FROM companies WHERE id = $1", [user.company_id])

    return NextResponse.json({ company: result.rows[0] || null })
  } catch (error) {
    console.error("[v0] Error fetching company:", error)
    return NextResponse.json({ error: "Erro ao buscar empresa" }, { status: 500 })
  }
}
