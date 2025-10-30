import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { parseNFeXML } from "@/lib/utils/nfe-parser"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    let user
    try {
      const authResult = await getAuthenticatedUser()
      user = authResult.user
    } catch (authError) {
      return NextResponse.json(
        { error: "Erro de autenticação", details: authError instanceof Error ? authError.message : String(authError) },
        { status: 401 },
      )
    }

    if (!user.company_id) {
      return NextResponse.json({ error: "Empresa não configurada" }, { status: 400 })
    }

    let xmlContent, fileName
    try {
      const body = await request.json()
      xmlContent = body.xmlContent
      fileName = body.fileName
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Erro ao ler dados da requisição",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    if (!xmlContent) {
      return NextResponse.json({ error: "Conteúdo XML não fornecido" }, { status: 400 })
    }

    let nfeData
    try {
      nfeData = await parseNFeXML(xmlContent)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Erro ao processar XML",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    let supabase
    try {
      supabase = createAdminClient()
    } catch (clientError) {
      return NextResponse.json(
        {
          error: "Erro ao conectar ao banco de dados",
          details: clientError instanceof Error ? clientError.message : String(clientError),
        },
        { status: 500 },
      )
    }

    try {
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id")
        .eq("company_id", user.company_id)
        .eq("nfe_key", nfeData.invoice.nfe_key)
        .maybeSingle()

      if (existingInvoice) {
        return NextResponse.json({ error: "XML já importado anteriormente" }, { status: 409 })
      }
    } catch (checkError) {
      return NextResponse.json(
        {
          error: "Erro ao verificar duplicatas",
          details: checkError instanceof Error ? checkError.message : String(checkError),
        },
        { status: 500 },
      )
    }

    let clientId = null
    if (nfeData.client) {
      try {
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("company_id", user.company_id)
          .eq("document", nfeData.client.document)
          .maybeSingle()

        if (existingClient) {
          clientId = existingClient.id
        } else {
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
            return NextResponse.json({ error: "Erro ao criar cliente", details: clientError.message }, { status: 500 })
          }
          clientId = newClient.id
        }
      } catch (clientError) {
        return NextResponse.json(
          {
            error: "Erro ao processar cliente",
            details: clientError instanceof Error ? clientError.message : String(clientError),
          },
          { status: 500 },
        )
      }
    }

    let invoice
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
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
        return NextResponse.json({ error: "Erro ao criar nota fiscal", details: invoiceError.message }, { status: 500 })
      }
      invoice = invoiceData
    } catch (invoiceError) {
      return NextResponse.json(
        {
          error: "Erro ao processar nota fiscal",
          details: invoiceError instanceof Error ? invoiceError.message : String(invoiceError),
        },
        { status: 500 },
      )
    }

    if (nfeData.items && nfeData.items.length > 0) {
      try {
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
          return NextResponse.json(
            { error: "Erro ao criar itens da nota", details: itemsError.message },
            { status: 500 },
          )
        }
      } catch (itemsError) {
        return NextResponse.json(
          {
            error: "Erro ao processar itens",
            details: itemsError instanceof Error ? itemsError.message : String(itemsError),
          },
          { status: 500 },
        )
      }
    }

    try {
      await supabase.from("import_history").insert({
        company_id: user.company_id,
        file_name: fileName,
        file_type: "nfe",
        status: "success",
        records_imported: nfeData.items.length,
        imported_by: user.id,
      })
    } catch (historyError) {
      // Don't fail the import if history recording fails
    }

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      message: "NFe importada com sucesso",
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro inesperado ao processar arquivo",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
