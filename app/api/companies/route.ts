import { NextResponse } from "next/server"
import { query, execute } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth/server-auth"

export async function POST(request: Request) {
  try {
    console.log("[v0] POST /api/companies - Starting")

    const user = await getCurrentUser()

    if (!user) {
      console.log("[v0] No user found, returning 401")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cnpj, email, phone, address, city, state, zip_code } = body

    if (!name || !cnpj || !email) {
      console.log("[v0] Missing required fields:", { name: !!name, cnpj: !!cnpj, email: !!email })
      return NextResponse.json({ error: "Nome, CNPJ e email são obrigatórios" }, { status: 400 })
    }

    const rows = await query(
      `INSERT INTO companies (name, cnpj, email, phone, address, city, state, zip_code, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [name, cnpj, email, phone || "", address || "", city || "", state || "", zip_code || ""],
    )

    const company = rows[0]
    console.log("[v0] Company created:", company?.id)

    await execute("UPDATE profiles SET company_id = $1, updated_at = NOW() WHERE id = $2", [company.id, user.id])
    console.log("[v0] User profile updated with company_id")

    return NextResponse.json(company)
  } catch (error: any) {
    console.error("[v0] Unexpected error in POST /api/companies:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: `Erro ao criar empresa: ${error.message}` }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log("[v0] GET /api/companies - Starting")
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (!user.company_id) {
      console.log("[v0] User has no company_id")
      return NextResponse.json({ company: null })
    }

    const rows = await query("SELECT * FROM companies WHERE id = $1", [user.company_id])
    console.log("[v0] Company fetched:", rows[0]?.id)

    return NextResponse.json({ company: rows[0] || null })
  } catch (error) {
    console.error("[v0] Error fetching company:", error)
    return NextResponse.json({ error: "Erro ao buscar empresa" }, { status: 500 })
  }
}
