import { NextResponse } from "next/server"
import { queryMany } from "@/lib/db/helpers"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

// Importante para Vercel
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company_id = user.company_id

    if (!company_id) {
      return NextResponse.json({ error: "Usuário sem empresa associada" }, { status: 400 })
    }

    const invoices = await queryMany(
      `
      SELECT
        i.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'document', c.cpf_cnpj,
          'document_type',
            CASE
              WHEN LENGTH(REGEXP_REPLACE(c.cpf_cnpj, '[^0-9]', '', 'g')) = 11 THEN 'cpf'
              ELSE 'cnpj'
            END,
          'city', c.city,
          'state', c.state
        ) AS client,
        (
          SELECT COALESCE(SUM(amount),0)
          FROM payments
          WHERE invoice_id = i.id
        ) AS paid_amount
      FROM invoices i
      LEFT JOIN clients c ON c.id = i.client_id
      WHERE i.company_id = $1
      ORDER BY i.issue_date DESC
      LIMIT 200
    `,
      [company_id],
    )

    return NextResponse.json(invoices)
  } catch (error) {
    console.error("[API] Error in /api/invoices:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
