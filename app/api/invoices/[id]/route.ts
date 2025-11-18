import { NextRequest, NextResponse } from "next/server"
import { queryOne, queryMany } from "@/lib/db/helpers"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const invoiceId = params.id

    const invoice = await queryOne(
      `
      SELECT i.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'document', c.cpf_cnpj,
          'document_type',
            CASE 
              WHEN LENGTH(regexp_replace(c.cpf_cnpj, '[^0-9]', '', 'g')) = 11 THEN 'cpf'
              ELSE 'cnpj'
            END,
          'email', c.email,
          'phone', c.phone,
          'address', c.address,
          'city', c.city,
          'state', c.state,
          'zip_code', c.zip_code
        ) AS client
      FROM invoices i
      LEFT JOIN clients c ON c.id = i.client_id
      WHERE i.id = $1 AND i.company_id = $2
      LIMIT 1
    `,
      [invoiceId, user.company_id]
    )

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const items = await queryMany(
      `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at ASC`,
      [invoiceId]
    )

    const payments = await queryMany(
      `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date DESC`,
      [invoiceId]
    )

    return NextResponse.json({
      ...invoice,
      invoice_items: items,
      payments,
    })
  } catch (error) {
    console.error("[API] Error fetching invoice detail:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
