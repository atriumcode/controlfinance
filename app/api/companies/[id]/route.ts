import { NextResponse } from "next/server"
import { execute, query } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth/server-auth"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] PUT /api/companies/[id] - Starting, id:", params.id)

    let user
    try {
      user = await getCurrentUser()
      console.log("[v0] Current user:", user?.id, user?.email)
    } catch (userError) {
      console.error("[v0] Error getting current user:", userError)
      return NextResponse.json({ error: "Erro ao obter usuário atual" }, { status: 500 })
    }

    if (!user) {
      console.log("[v0] No user found, returning 401")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
      console.log("[v0] Update request body:", JSON.stringify(body))
    } catch (parseError) {
      console.error("[v0] Error parsing request body:", parseError)
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { name, cnpj, email, phone, address, city, state, zip_code, logo_url } = body

    // Validate required fields
    if (!name || !cnpj || !email) {
      console.log("[v0] Missing required fields:", { name: !!name, cnpj: !!cnpj, email: !!email })
      return NextResponse.json({ error: "Nome, CNPJ e email são obrigatórios" }, { status: 400 })
    }

    try {
      console.log("[v0] Updating company...")
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
          logo_url || null,
          params.id,
        ],
      )
      console.log("[v0] Update successful")
    } catch (updateError: any) {
      console.error("[v0] Error updating company:", updateError)
      console.error("[v0] Error details:", updateError.message, updateError.code)
      return NextResponse.json({ error: `Erro ao atualizar empresa: ${updateError.message}` }, { status: 500 })
    }

    let rows
    try {
      rows = await query("SELECT * FROM companies WHERE id = $1", [params.id])
      console.log("[v0] Company fetched after update:", rows[0]?.id)
    } catch (queryError: any) {
      console.error("[v0] Error fetching updated company:", queryError)
      return NextResponse.json(
        { error: `Empresa atualizada mas erro ao buscar: ${queryError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error("[v0] Unexpected error in PUT /api/companies/[id]:", error)
    console.error("[v0] Error stack:", error.stack)
    return NextResponse.json({ error: `Erro ao atualizar empresa: ${error.message}` }, { status: 500 })
  }
}
