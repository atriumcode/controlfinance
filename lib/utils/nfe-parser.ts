// NF-e XML Parser for Brazilian Electronic Invoice
import { XMLParser } from "fast-xml-parser"

export interface NFEData {
  invoice: {
    number: string
    nfe_key: string
    issue_date: string
    due_date?: string
    total_amount: number
    tax_amount: number
    discount_amount: number
    net_amount: number
  }
  client?: {
    name: string
    document: string
    document_type: "cpf" | "cnpj"
    email?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
  }
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    total_price: number
    tax_rate?: number
  }>
}

export async function parseNFeXML(xmlContent: string): Promise<NFEData> {
  try {
    console.log("[v0] Starting NFe XML parsing...")

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      trimValues: true,
    })

    const result = parser.parse(xmlContent)
    console.log("[v0] XML parsed successfully, extracting data...")

    // Navigate through the XML structure
    const nfeProc = result.nfeProc || result
    const nfe = nfeProc.NFe || nfeProc.nfe || nfeProc
    const infNFe = nfe.infNFe || nfe.infNfe || {}

    // Extract NFe key from Id attribute
    const nfeKey = (infNFe["@_Id"] || infNFe["@_id"] || "").replace("NFe", "")
    console.log("[v0] NFe Key:", nfeKey)

    // Extract invoice data
    const ide = infNFe.ide || {}
    const invoiceNumber = String(ide.nNF || "")
    const issueDate = ide.dhEmi || ide.dEmi || ""
    console.log("[v0] Invoice Number:", invoiceNumber, "Issue Date:", issueDate)

    // Extract totals
    const total = infNFe.total || {}
    const icmsTot = total.ICMSTot || {}
    const totalAmount = Number.parseFloat(String(icmsTot.vNF || 0))
    const taxAmount = Number.parseFloat(String(icmsTot.vTotTrib || 0))
    const discountAmount = Number.parseFloat(String(icmsTot.vDesc || 0))
    console.log("[v0] Total Amount:", totalAmount, "Tax:", taxAmount, "Discount:", discountAmount)

    // Extract client data
    const dest = infNFe.dest || {}
    let client = null

    if (dest && (dest.xNome || dest.CNPJ || dest.CPF)) {
      const clientName = dest.xNome || ""
      const clientCNPJ = dest.CNPJ || ""
      const clientCPF = dest.CPF || ""
      const clientDocument = clientCNPJ || clientCPF || ""
      const documentType = clientCNPJ ? "cnpj" : "cpf"

      // Extract address
      const enderDest = dest.enderDest || {}
      const address = enderDest.xLgr || ""
      const city = enderDest.xMun || ""
      const state = enderDest.UF || ""
      const zipCode = enderDest.CEP || ""

      console.log("[v0] Client:", clientName, "Document:", clientDocument)

      if (clientName && clientDocument) {
        client = {
          name: clientName,
          document: String(clientDocument),
          document_type: documentType as "cpf" | "cnpj",
          address,
          city,
          state,
          zip_code: String(zipCode),
        }
      }
    }

    // Extract items
    const items: NFEData["items"] = []
    const det = infNFe.det || []
    const detArray = Array.isArray(det) ? det : [det]

    console.log("[v0] Found", detArray.length, "items")

    detArray.forEach((detItem: any, index: number) => {
      const prod = detItem.prod || {}
      const description = prod.xProd || ""
      const quantity = Number.parseFloat(String(prod.qCom || 1))
      const unitPrice = Number.parseFloat(String(prod.vUnCom || 0))
      const totalPrice = Number.parseFloat(String(prod.vProd || 0))

      console.log(`[v0] Item ${index + 1}:`, description, "Qty:", quantity, "Price:", totalPrice)

      // Extract tax information if available
      const imposto = detItem.imposto || {}
      const icms = imposto.ICMS || {}
      let taxRate = 0

      // Try different ICMS types
      const icmsTypes = [
        "ICMS00",
        "ICMS10",
        "ICMS20",
        "ICMS30",
        "ICMS40",
        "ICMS51",
        "ICMS60",
        "ICMS70",
        "ICMS90",
        "ICMSSN102",
        "ICMSSN103",
      ]

      for (const type of icmsTypes) {
        if (icms[type]) {
          taxRate = Number.parseFloat(String(icms[type].pICMS || 0))
          break
        }
      }

      if (description) {
        items.push({
          description,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          tax_rate: taxRate,
        })
      }
    })

    // Format date
    const formatDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString().split("T")[0]

      // Handle different date formats
      if (dateStr.includes("T")) {
        return dateStr.split("T")[0]
      }
      if (dateStr.includes("-")) {
        return dateStr.split(" ")[0]
      }
      // Handle YYYY-MM-DD format
      if (dateStr.length >= 10) {
        return dateStr.substring(0, 10)
      }
      return new Date().toISOString().split("T")[0]
    }

    const nfeData: NFEData = {
      invoice: {
        number: invoiceNumber,
        nfe_key: nfeKey,
        issue_date: formatDate(issueDate),
        total_amount: totalAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        net_amount: totalAmount - discountAmount,
      },
      client,
      items,
    }

    // Validate required fields
    if (!nfeData.invoice.number) {
      console.error("[v0] Invoice number not found")
      throw new Error("Número da nota fiscal não encontrado no XML")
    }

    if (!nfeData.invoice.nfe_key) {
      console.error("[v0] NFe key not found")
      throw new Error("Chave da NF-e não encontrada no XML")
    }

    if (nfeData.invoice.total_amount <= 0) {
      console.error("[v0] Invalid total amount:", nfeData.invoice.total_amount)
      throw new Error("Valor total da nota fiscal inválido")
    }

    if (items.length === 0) {
      console.error("[v0] No items found in XML")
      throw new Error("Nenhum item encontrado no XML da NF-e")
    }

    console.log("[v0] NFe parsing completed successfully!")
    return nfeData
  } catch (error) {
    console.error("[v0] Error parsing NFe XML:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Erro desconhecido ao processar XML da NF-e")
  }
}
