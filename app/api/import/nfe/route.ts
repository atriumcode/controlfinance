export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { parseNFeXML } from "@/lib/utils/nfe-parser"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  console.log("[v0] API /api/import/nfe chamada")

  try {
    console.log("[v0] Iniciando autenticação...")
    const user = await getAuthenticatedUser()

    if (!user) {
      console.log("[v0] Usuário não autenticado")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    console.log("[v0] Usuário autenticado:", user.id, "company_id:", user.company?.id)

    if (!user.company?.id) {
      console.log("[v0] Empresa não configurada")
      return NextResponse.json({ error: "Empresa não configurada" }, { status: 400 })
    }

const companyId = user.company.id


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
      const { data: existingInvoice } = await supabase
        .from("invoices")
        .select("id")
        .eq("company_id", companyId)
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
    console.log("[v0] nfeData.client existe?", !!nfeData.client)
    console.log("[v0] Dados do cliente:", JSON.stringify(nfeData.client, null, 2))

    if (nfeData.client) {
      try {
        console.log("[v0] Buscando cliente existente com documento:", nfeData.client.document)
        const { data: existingClient, error: findError } = await supabase
          .from("clients")
          .select("id")
          .eq("company_id", user.company_id)
          .eq("document", nfeData.client.document)
          .maybeSingle()

        console.log("[v0] Resultado da busca:", { existingClient, findError })

        if (existingClient) {
          clientId = existingClient.id
          console.log("[v0] Cliente existente encontrado:", clientId)
        } else {
          console.log("[v0] Cliente não encontrado, criando novo...")
          console.log("[v0] Dados para inserção:", {
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

          const { data: newClient } = await supabase
            .from("clients")
            .insert({
              company_id: companyId,
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

          console.log("[v0] Resultado da criação:", { newClient, clientError })

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
    } else {
      console.log("[v0] AVISO: nfeData.client é null/undefined - nota será criada sem cliente!")
    }

    console.log("[v0] clientId final antes de criar nota:", clientId)
    console.log("[v0] Criando nota fiscal...")
    let invoice
    try {
      const invoiceData = {
        company_id: companyId,
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
      }

      console.log("[v0] Dados da nota para inserção:", JSON.stringify(invoiceData, null, 2))

      const { data: invoiceResult, error: invoiceError } = await supabase
        .from("invoices")
        .insert(invoiceData)
        .select("id, client_id")
        .single()

      console.log("[v0] Resultado da criação da nota:", { invoiceResult, invoiceError })

      if (invoiceError) {
        console.log("[v0] Erro ao criar nota fiscal:", invoiceError)
        return NextResponse.json({ error: "Erro ao criar nota fiscal", details: invoiceError.message }, { status: 500 })
      }
      invoice = invoiceResult
      console.log("[v0] Nota fiscal criada:", invoice.id, "com client_id:", invoice.client_id)
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
        company_id: companyId,
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
      debug: {
        hasClient: !!nfeData.client,
        clientData: nfeData.client,
        clientId: clientId,
        invoiceNumber: nfeData.invoice.number,
        itemsCount: nfeData.items?.length || 0,
        items: nfeData.items?.slice(0, 3), // First 3 items for debugging
      },
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
