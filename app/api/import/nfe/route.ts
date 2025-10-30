import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { parseNFeXML } from "@/lib/utils/nfe-parser"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API /api/import/nfe chamada")

  try {
    console.log("[v0] Iniciando autenticação...")
    let user
    try {
      const authResult = await getAuthenticatedUser()
      user = authResult.user
      console.log("[v0] Usuário autenticado:", user.id, "company_id:", user.company_id)
    } catch (authError) {
      console.log("[v0] Erro de autenticação:", authError)
      return NextResponse.json(
        { error: "Erro de autenticação", details: authError instanceof Error ? authError.message : String(authError) },
        { status: 401 },
      )
    }

    if (!user.company_id) {
      console.log("[v0] Empresa não configurada")
      return NextResponse.json({ error: "Empresa não configurada" }, { status: 400 })
    }

    console.log("[v0] Lendo dados da requisição...")
    let xmlContent, fileName
    try {
      const body = await request.json()
      xmlContent = body.xmlContent
      fileName = body.fileName
      console.log("[v0] Arquivo:", fileName, "Tamanho XML:", xmlContent?.length)
    } catch (parseError) {
      console.log("[v0] Erro ao ler dados:", parseError)
      return NextResponse.json(
        {
          error: "Erro ao ler dados da requisição",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    if (!xmlContent) {
      console.log("[v0] Conteúdo XML vazio")
      return NextResponse.json({ error: "Conteúdo XML não fornecido" }, { status: 400 })
    }

    console.log("[v0] Parseando XML...")
    let nfeData
    try {
      nfeData = await parseNFeXML(xmlContent)
      console.log("[v0] XML parseado com sucesso. Itens:", nfeData.items?.length)
    } catch (parseError) {
      console.log("[v0] Erro ao parsear XML:", parseError)
      return NextResponse.json(
        {
          error: "Erro ao processar XML",
          details: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 },
      )
    }

    console.log("[v0] Criando cliente admin Supabase...")
    let supabase
    try {
      supabase = createAdminClient()
      console.log("[v0] Cliente admin criado com sucesso")
    } catch (clientError) {
      console.log("[v0] Erro ao criar cliente:", clientError)
      return NextResponse.json(
        {
          error: "Erro ao conectar ao banco de dados",
          details: clientError instanceof Error ? clientError.message : String(clientError),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Verificando duplicatas...")
    try {
      const { data: existingInvoice, error: checkError } = await supabase
        .from("invoices")
        .select("id")
        .eq("company_id", user.company_id)
        .eq("nfe_key", nfeData.invoice.nfe_key)
        .maybeSingle()

      if (checkError) {
        console.log("[v0] Erro na query de duplicatas:", checkError)
        throw checkError
      }

      if (existingInvoice) {
        console.log("[v0] XML já importado")
        return NextResponse.json({ error: "XML já importado anteriormente" }, { status: 409 })
      }
      console.log("[v0] Nenhuma duplicata encontrada")
    } catch (checkError) {
      console.log("[v0] Erro ao verificar duplicatas:", checkError)
      return NextResponse.json(
        {
          error: "Erro ao verificar duplicatas",
          details: checkError instanceof Error ? checkError.message : String(checkError),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Processando cliente...")
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
          console.log("[v0] Cliente existente encontrado:", clientId)
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
            console.log("[v0] Erro ao criar cliente:", clientError)
            return NextResponse.json({ error: "Erro ao criar cliente", details: clientError.message }, { status: 500 })
          }
          clientId = newClient.id
          console.log("[v0] Novo cliente criado:", clientId)
        }
      } catch (clientError) {
        console.log("[v0] Erro ao processar cliente:", clientError)
        return NextResponse.json(
          {
            error: "Erro ao processar cliente",
            details: clientError instanceof Error ? clientError.message : String(clientError),
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] Criando nota fiscal...")
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
        console.log("[v0] Erro ao criar nota fiscal:", invoiceError)
        return NextResponse.json({ error: "Erro ao criar nota fiscal", details: invoiceError.message }, { status: 500 })
      }
      invoice = invoiceData
      console.log("[v0] Nota fiscal criada:", invoice.id)
    } catch (invoiceError) {
      console.log("[v0] Erro ao processar nota fiscal:", invoiceError)
      return NextResponse.json(
        {
          error: "Erro ao processar nota fiscal",
          details: invoiceError instanceof Error ? invoiceError.message : String(invoiceError),
        },
        { status: 500 },
      )
    }

    console.log("[v0] Criando itens da nota...")
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
          console.log("[v0] Erro ao criar itens:", itemsError)
          return NextResponse.json(
            { error: "Erro ao criar itens da nota", details: itemsError.message },
            { status: 500 },
          )
        }
        console.log("[v0] Itens criados com sucesso:", items.length)
      } catch (itemsError) {
        console.log("[v0] Erro ao processar itens:", itemsError)
        return NextResponse.json(
          {
            error: "Erro ao processar itens",
            details: itemsError instanceof Error ? itemsError.message : String(itemsError),
          },
          { status: 500 },
        )
      }
    }

    console.log("[v0] Registrando histórico...")
    try {
      await supabase.from("import_history").insert({
        company_id: user.company_id,
        file_name: fileName,
        file_type: "nfe",
        status: "success",
        records_imported: nfeData.items.length,
        imported_by: user.id,
      })
      console.log("[v0] Histórico registrado")
    } catch (historyError) {
      console.log("[v0] Erro ao registrar histórico (não crítico):", historyError)
    }

    console.log("[v0] Importação concluída com sucesso!")
    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      message: "NFe importada com sucesso",
    })
  } catch (error) {
    console.log("[v0] Erro inesperado:", error)
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
