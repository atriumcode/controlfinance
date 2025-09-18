// NF-e XML Parser for Brazilian Electronic Invoice
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
    // Parse XML using DOMParser
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror")
    if (parserError) {
      throw new Error("Erro ao analisar XML: formato inválido")
    }

    // Extract NF-e key from infNFe id attribute
    const infNFe = xmlDoc.querySelector("infNFe")
    const nfeKey = infNFe?.getAttribute("Id")?.replace("NFe", "") || ""

    // Extract invoice information
    const ide = xmlDoc.querySelector("ide")
    const invoiceNumber = ide?.querySelector("nNF")?.textContent || ""
    const issueDate = ide?.querySelector("dhEmi")?.textContent || ide?.querySelector("dEmi")?.textContent || ""

    // Extract totals
    const total = xmlDoc.querySelector("total ICMSTot")
    const totalAmount = Number.parseFloat(total?.querySelector("vNF")?.textContent || "0")
    const taxAmount = Number.parseFloat(total?.querySelector("vTotTrib")?.textContent || "0")
    const discountAmount = Number.parseFloat(total?.querySelector("vDesc")?.textContent || "0")

    // Extract client information (destinatário)
    const dest = xmlDoc.querySelector("dest")
    let client = null

    if (dest) {
      const clientName = dest.querySelector("xNome")?.textContent || ""
      const clientCNPJ = dest.querySelector("CNPJ")?.textContent
      const clientCPF = dest.querySelector("CPF")?.textContent
      const clientDocument = clientCNPJ || clientCPF || ""
      const documentType = clientCNPJ ? "cnpj" : "cpf"

      // Extract address
      const enderDest = dest.querySelector("enderDest")
      const address = enderDest?.querySelector("xLgr")?.textContent || ""
      const city = enderDest?.querySelector("xMun")?.textContent || ""
      const state = enderDest?.querySelector("UF")?.textContent || ""
      const zipCode = enderDest?.querySelector("CEP")?.textContent || ""

      if (clientName && clientDocument) {
        client = {
          name: clientName,
          document: clientDocument,
          document_type: documentType as "cpf" | "cnpj",
          address,
          city,
          state,
          zip_code: zipCode,
        }
      }
    }

    // Extract items
    const items: NFEData["items"] = []
    const detElements = xmlDoc.querySelectorAll("det")

    detElements.forEach((det) => {
      const prod = det.querySelector("prod")
      if (prod) {
        const description = prod.querySelector("xProd")?.textContent || ""
        const quantity = Number.parseFloat(prod.querySelector("qCom")?.textContent || "1")
        const unitPrice = Number.parseFloat(prod.querySelector("vUnCom")?.textContent || "0")
        const totalPrice = Number.parseFloat(prod.querySelector("vProd")?.textContent || "0")

        // Extract tax information if available
        const imposto = det.querySelector("imposto")
        let taxRate = 0
        if (imposto) {
          const icms = imposto.querySelector("ICMS")
          if (icms) {
            const icmsElement = icms.querySelector(
              "ICMS00, ICMS10, ICMS20, ICMS30, ICMS40, ICMS51, ICMS60, ICMS70, ICMS90",
            )
            if (icmsElement) {
              taxRate = Number.parseFloat(icmsElement.querySelector("pICMS")?.textContent || "0")
            }
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
      throw new Error("Número da nota fiscal não encontrado no XML")
    }

    if (!nfeData.invoice.nfe_key) {
      throw new Error("Chave da NF-e não encontrada no XML")
    }

    if (nfeData.invoice.total_amount <= 0) {
      throw new Error("Valor total da nota fiscal inválido")
    }

    return nfeData
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Erro desconhecido ao processar XML da NF-e")
  }
}
