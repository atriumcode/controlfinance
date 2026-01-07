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
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: false,
      trimValues: true,
    })

    const result = parser.parse(xmlContent)

    const nfeProc = result.nfeProc || result
    const nfe = nfeProc.NFe || nfeProc.nfe || nfeProc
    const infNFe = nfe.infNFe || nfe.infNfe || {}

    const nfeKey = (infNFe["@_Id"] || infNFe["@_id"] || "").replace("NFe", "")

    const ide = infNFe.ide || {}
    const invoiceNumber = String(ide.nNF || "")
    const issueDate = ide.dhEmi || ide.dEmi || ""

    const total = infNFe.total || {}
    const icmsTot = total.ICMSTot || {}
    const totalAmount = Number.parseFloat(String(icmsTot.vNF || 0))
    const taxAmount = Number.parseFloat(String(icmsTot.vTotTrib || 0))
    const discountAmount = Number.parseFloat(String(icmsTot.vDesc || 0))

    const dest = infNFe.dest || {}
    let client = null

    if (dest && (dest.xNome || dest.CNPJ || dest.CPF)) {
      const clientName = dest.xNome || ""
      const clientCNPJ = String(dest.CNPJ || "").padStart(14, "0")
      const clientCPF = String(dest.CPF || "").padStart(11, "0")
      const clientDocument = clientCNPJ !== "00000000000000" ? clientCNPJ : clientCPF !== "00000000000" ? clientCPF : ""
      const documentType = clientCNPJ !== "00000000000000" ? "cnpj" : "cpf"

      const enderDest = dest.enderDest || {}
      const address = enderDest.xLgr || ""
      const city = enderDest.xMun || ""
      const state = enderDest.UF || ""
      const zipCode = enderDest.CEP || ""

      if (clientName && clientDocument) {
        client = {
          name: clientName,
          document: clientDocument,
          document_type: documentType as "cpf" | "cnpj",
          address,
          city,
          state,
          zip_code: String(zipCode).padStart(8, "0"),
        }
      }
    }

    const items: NFEData["items"] = []
    const det = infNFe.det || []
    const detArray = Array.isArray(det) ? det : [det]

    detArray.forEach((detItem: any) => {
      const prod = detItem.prod || {}
      const description = prod.xProd || ""
      const quantity = Number.parseFloat(String(prod.qCom || 1))
      const unitPrice = Number.parseFloat(String(prod.vUnCom || 0))
      const totalPrice = Number.parseFloat(String(prod.vProd || 0))

      const imposto = detItem.imposto || {}
      const icms = imposto.ICMS || {}
      let taxRate = 0

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

    const formatDate = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString().split("T")[0]

      if (dateStr.includes("T")) {
        return dateStr.split("T")[0]
      }
      if (dateStr.includes("-")) {
        return dateStr.split(" ")[0]
      }
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

    if (!nfeData.invoice.number) {
      throw new Error("Número da nota fiscal não encontrado no XML")
    }

    if (!nfeData.invoice.nfe_key) {
      throw new Error("Chave da NF-e não encontrada no XML")
    }

    if (nfeData.invoice.total_amount <= 0) {
      throw new Error("Valor total da nota fiscal inválido")
    }

    if (items.length === 0) {
      throw new Error("Nenhum item encontrado no XML da NF-e")
    }

    return nfeData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Erro desconhecido ao processar XML da NF-e")
  }
}
