import { NextResponse } from "next/server"
import { query } from "@/lib/db/postgres"
import { getCurrentUser } from "@/lib/auth"
import { parseStringPromise } from "xml2js"

export async function POST(request: Request) {
  try {
    console.log("[v0] API /api/import/nfe - Iniciando processamento")

    const user = await getCurrentUser()
    if (!user) {
      console.log("[v0] Usuário não autenticado")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { xmlContent, fileName } = body

    if (!xmlContent) {
      console.log("[v0] XML content não fornecido")
      return NextResponse.json({ error: "Conteúdo XML não fornecido" }, { status: 400 })
    }

    console.log("[v0] Parseando XML...")

    // Parse XML
    let parsedXml: any
    try {
      parsedXml = await parseStringPromise(xmlContent, {
        explicitArray: false,
        mergeAttrs: true,
        explicitRoot: false,
      })
    } catch (error) {
      console.error("[v0] Erro ao parsear XML:", error)
      return NextResponse.json(
        { error: "Erro ao parsear XML", details: error instanceof Error ? error.message : "Erro desconhecido" },
        { status: 400 },
      )
    }

    console.log("[v0] XML parseado com sucesso")

    const nfe = parsedXml.NFe || parsedXml.nfeProc?.NFe || parsedXml
    const infNFe = nfe.infNFe || {}
    const ide = infNFe.ide || {}
    const emit = infNFe.emit || {}
    const dest = infNFe.dest || {}
    const total = infNFe.total?.ICMSTot || {}

    const nfeData = {
      invoice_number: ide.nNF || "",
      issue_date: ide.dhEmi || ide.dEmi || new Date().toISOString(),
      issuer_name: emit.xNome || "",
      issuer_cnpj: emit.CNPJ || emit.CPF || "",
      recipient_name: dest.xNome || "",
      recipient_cnpj: dest.CNPJ || dest.CPF || "",
      total_amount: Number.parseFloat(total.vNF || "0"),
    }

    console.log("[v0] Dados extraídos da NF-e:", nfeData)

    let clientId = null
    if (nfeData.recipient_cnpj) {
      console.log("[v0] Buscando cliente por documento:", nfeData.recipient_cnpj)

      const existingClient = await query("SELECT id FROM clients WHERE document = $1 AND company_id = $2", [
        nfeData.recipient_cnpj,
        user.company_id,
      ])

      if (existingClient && existingClient.length > 0) {
        clientId = existingClient[0].id
        console.log("[v0] Cliente encontrado:", clientId)
      } else {
        console.log("[v0] Criando novo cliente")
        const document_type = nfeData.recipient_cnpj.length === 11 ? "CPF" : "CNPJ"
        const newClient = await query(
          `INSERT INTO clients (company_id, name, document, document_type, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, NOW(), NOW()) 
           RETURNING id`,
          [user.company_id, nfeData.recipient_name, nfeData.recipient_cnpj, document_type],
        )
        clientId = newClient[0].id
        console.log("[v0] Novo cliente criado:", clientId)
      }
    }

    console.log("[v0] Verificando duplicidade de NF-e")
    const existingInvoice = await query("SELECT id FROM invoices WHERE invoice_number = $1 AND company_id = $2", [
      nfeData.invoice_number,
      user.company_id,
    ])

    if (existingInvoice && existingInvoice.length > 0) {
      console.log("[v0] NF-e já existe no sistema")
      return NextResponse.json(
        { error: "NF-e já importada", details: "Esta nota fiscal já existe no sistema" },
        { status: 400 },
      )
    }

    console.log("[v0] Inserindo NF-e no banco de dados")
    const result = await query(
      `INSERT INTO invoices (
        company_id, client_id, invoice_number, 
        issue_date, due_date, total_amount, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
      RETURNING id`,
      [
        user.company_id,
        clientId,
        nfeData.invoice_number,
        nfeData.issue_date,
        nfeData.issue_date, // due_date = issue_date por padrão
        nfeData.total_amount,
        "pending",
      ],
    )

    console.log("[v0] NF-e importada com sucesso, ID:", result[0].id)

    return NextResponse.json({
      success: true,
      message: "NF-e importada com sucesso",
      nfe_data: nfeData,
      invoice_id: result[0].id,
    })
  } catch (error) {
    console.error("[v0] Erro ao processar NF-e:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar NF-e",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
