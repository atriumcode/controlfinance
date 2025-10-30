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

function getElementText(parent: Element | Document, tagName: string): string {
  // Try with querySelector first
  const element = parent.querySelector(tagName)
  if (element) return element.textContent || ""

  // Try with getElementsByTagName (works better with namespaces)
  const elements = parent.getElementsByTagName(tagName)
  if (elements.length > 0) return elements[0].textContent || ""

  // Try with namespace wildcard
  const nsElements = parent.getElementsByTagNameNS("*", tagName)
  if (nsElements.length > 0) return nsElements[0].textContent || ""

  return ""
}

function getElement(parent: Element | Document, tagName: string): Element | null {
  // Try with querySelector first
  const element = parent.querySelector(tagName)
  if (element) return element

  // Try with getElementsByTagName (works better with namespaces)
  const elements = parent.getElementsByTagName(tagName)
  if (elements.length > 0) return elements[0]

  // Try with namespace wildcard
  const nsElements = parent.getElementsByTagNameNS("*", tagName)
  if (nsElements.length > 0) return nsElements[0]

  return null
}

function getElements(parent: Element | Document, tagName: string): Element[] {
  // Try with querySelectorAll first
  let elements = Array.from(parent.querySelectorAll(tagName))
  if (elements.length > 0) return elements

  // Try with getElementsByTagName (works better with namespaces)
  elements = Array.from(parent.getElementsByTagName(tagName))
  if (elements.length > 0) return elements

  // Try with namespace wildcard
  elements = Array.from(parent.getElementsByTagNameNS("*", tagName))
  return elements
}

export async function parseNFeXML(xmlContent: string): Promise<NFEData> {
  try {
    console.log("[v0] Starting NFe XML parsing...")

    // Parse XML using DOMParser
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror")
    if (parserError) {
      console.error("[v0] XML parsing error:", parserError.textContent)
      throw new Error("Erro ao analisar XML: formato inválido")
    }

    console.log("[v0] XML parsed successfully, extracting data...")

    const infNFe = getElement(xmlDoc, "infNFe")
    const nfeKey = infNFe?.getAttribute("Id")?.replace("NFe", "") || ""
    console.log("[v0] NFe Key:", nfeKey)

    const ide = getElement(xmlDoc, "ide")
    const invoiceNumber = getElementText(ide || xmlDoc, "nNF")
    const issueDate = getElementText(ide || xmlDoc, "dhEmi") || getElementText(ide || xmlDoc, "dEmi")
    console.log("[v0] Invoice Number:", invoiceNumber, "Issue Date:", issueDate)

    const total = getElement(xmlDoc, "total")
    const icmsTot = getElement(total || xmlDoc, "ICMSTot")
    const totalAmount = Number.parseFloat(getElementText(icmsTot || xmlDoc, "vNF") || "0")
    const taxAmount = Number.parseFloat(getElementText(icmsTot || xmlDoc, "vTotTrib") || "0")
    const discountAmount = Number.parseFloat(getElementText(icmsTot || xmlDoc, "vDesc") || "0")
    console.log("[v0] Total Amount:", totalAmount, "Tax:", taxAmount, "Discount:", discountAmount)

    const dest = getElement(xmlDoc, "dest")
    let client = null

    if (dest) {
      const clientName = getElementText(dest, "xNome")
      const clientCNPJ = getElementText(dest, "CNPJ")
      const clientCPF = getElementText(dest, "CPF")
      const clientDocument = clientCNPJ || clientCPF || ""
      const documentType = clientCNPJ ? "cnpj" : "cpf"

      // Extract address
      const enderDest = getElement(dest, "enderDest")
      const address = getElementText(enderDest || dest, "xLgr")
      const city = getElementText(enderDest || dest, "xMun")
      const state = getElementText(enderDest || dest, "UF")
      const zipCode = getElementText(enderDest || dest, "CEP")

      console.log("[v0] Client:", clientName, "Document:", clientDocument)

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

    const items: NFEData["items"] = []
    const detElements = getElements(xmlDoc, "det")
    console.log("[v0] Found", detElements.length, "items")

    detElements.forEach((det, index) => {
      const prod = getElement(det, "prod")
      if (prod) {
        const description = getElementText(prod, "xProd")
        const quantity = Number.parseFloat(getElementText(prod, "qCom") || "1")
        const unitPrice = Number.parseFloat(getElementText(prod, "vUnCom") || "0")
        const totalPrice = Number.parseFloat(getElementText(prod, "vProd") || "0")

        console.log(`[v0] Item ${index + 1}:`, description, "Qty:", quantity, "Price:", totalPrice)

        // Extract tax information if available
        const imposto = getElement(det, "imposto")
        let taxRate = 0
        if (imposto) {
          const icms = getElement(imposto, "ICMS")
          if (icms) {
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
              const icmsElement = getElement(icms, type)
              if (icmsElement) {
                taxRate = Number.parseFloat(getElementText(icmsElement, "pICMS") || "0")
                break
              }
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
