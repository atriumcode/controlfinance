import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { parseNFeXML } from "@/lib/utils/nfe-parser"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting NFe import process")

    const { user } = await getAuthenticatedUser()
    console.log("[v0] User authenticated:", user.id, "Company:", user.company_id)

    if (!user.company_id) {
      return NextResponse.json({ error: "Empresa não configurada" }, { status: 400 })
    }

    const { xmlContent, fileName } = await request.json()
    console.log("[v0] Received XML file:", fileName)

    if (!xmlContent) {
      return NextResponse.json({ error: "Conteúdo XML não fornecido" }, { status: 400 })
    }

    console.log("[v0] Parsing NFe XML...")
    const nfeData = await parseNFeXML(xmlContent)
    console.log("[v0] NFe parsed successfully:", nfeData.invoice.number, "Items:", nfeData.items.length)

    const supabase = await createClient()

    console.log("[v0] Checking for duplicate invoice with key:", nfeData.invoice.nfe_key)
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("company_id", user.company_id)
      .eq("nfe_key", nfeData.invoice.nfe_key)
      .maybeSingle()

    if (existingInvoice) {
      console.log("[v0] Invoice already exists:", existingInvoice.id)
      return NextResponse.json({ error: "XML já importado" }, { status: 409 })
    }

    let clientId = null
    if (nfeData.client) {
      console.log("[v0] Processing client:", nfeData.client.name, nfeData.client.document)

      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("company_id", user.company_id)
        .eq("document", nfeData.client.document)
        .maybeSingle()

      if (existingClient) {
        console.log("[v0] Client already exists:", existingClient.id)
        clientId = existingClient.id
      } else {
        console.log("[v0] Creating new client...")
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            company_id: user.company_id,
            name: nfeData.client.name,
            document: nfeData.client.document,
            document_type: nfeData.client.document_type,
            email: nfeData.client.email,
            address: nfeData.client.address,
            city: nfeData.client.city,
            state: nfeData.client.state,
            zip_code: nfeData.client.zip_code,
          })
          .select("id")
          .single()

        if (clientError) {
          console.error("[v0] Error creating client:", clientError)
          throw new Error(`Erro ao criar cliente: ${clientError.message}`)
        }
        console.log("[v0] Client created:", newClient.id)
        clientId = newClient.id
      }
    }

    console.log("[v0] Creating invoice...")
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        company_id: user.company_id,
        client_id: clientId,
        invoice_number: nfeData.invoice.number,
        nfe_key: nfeData.invoice.nfe_key,
        issue_date: nfeData.invoice.issue_date,
        due_date: nfeData.invoice.due_date,
        total_amount: nfeData.invoice.total_amount,
        tax_amount: nfeData.invoice.tax_amount,
        discount_amount: nfeData.invoice.discount_amount,
        net_amount: nfeData.invoice.net_amount,
        status: "pending",
        xml_content: xmlContent,
      })
      .select("id")
      .single()

    if (invoiceError) {
      console.error("[v0] Error creating invoice:", invoiceError)
      throw new Error(`Erro ao criar nota fiscal: ${invoiceError.message}`)
    }
    console.log("[v0] Invoice created:", invoice.id)

    if (nfeData.items && nfeData.items.length > 0) {
      console.log("[v0] Creating", nfeData.items.length, "invoice items...")
      const items = nfeData.items.map((item: any) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        tax_rate: item.tax_rate || 0,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(items)

      if (itemsError) {
        console.error("[v0] Error creating invoice items:", itemsError)
        throw new Error(`Erro ao criar itens da nota: ${itemsError.message}`)
      }
      console.log("[v0] Invoice items created successfully")
    }

    console.log("[v0] Recording import history...")
    const { error: historyError } = await supabase.from("import_history").insert({
      company_id: user.company_id,
      file_name: fileName,
      file_type: "nfe",
      status: "success",
      records_imported: nfeData.items.length,
      imported_by: user.id,
    })

    if (historyError) {
      console.error("[v0] Error recording import history:", historyError)
      // Don't fail the import if history recording fails
    }

    console.log("[v0] NFe import completed successfully!")
    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      nfe_data: nfeData,
    })
  } catch (error) {
    console.error("[v0] Error processing NFe import:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao processar arquivo",
      },
      { status: 500 },
    )
  }
}
