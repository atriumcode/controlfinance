import { type NextRequest, NextResponse } from "next/server"
import { queryMany } from "@/lib/db/helpers"
import { getCurrentUser } from "@/lib/auth/server-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const company_id = searchParams.get("company_id")

    if (!company_id) {
      return NextResponse.json({ error: "Missing company_id" }, { status: 400 })
    }

    // Fetch invoices with client data
    const invoices = await queryMany(
      `
      SELECT 
        i.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'document', c.cpf_cnpj,
          'document_type', CASE 
            WHEN LENGTH(REPLACE(REPLACE(c.cpf_cnpj, '.', ''), '-', '')) = 11 THEN 'CPF'
            ELSE 'CNPJ'
          END,
          'city', c.city,
          'state', c.state
        ) as clients
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC
      LIMIT 200
    `,
      [company_id],
    )

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[v0] Error fetching invoices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
