export interface OFXTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: "entrada" | "saida"
  fitid?: string
  memo?: string
}

export interface OFXData {
  bankId: string
  accountId: string
  accountType: string
  startDate: string
  endDate: string
  transactions: OFXTransaction[]
}

export class OFXParser {
  static async parseFile(file: File): Promise<OFXData> {
    const arrayBuffer = await file.arrayBuffer()
    const decoder = new TextDecoder("utf-8", { fatal: false })
    let content = decoder.decode(arrayBuffer)

    // Try different encodings if UTF-8 fails
    if (content.includes("") || content.includes("?")) {
      const latin1Decoder = new TextDecoder("iso-8859-1")
      content = latin1Decoder.decode(arrayBuffer)
    }

    return this.parseContent(content)
  }

  static parseContent(content: string): OFXData {
    let normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

    // Fix common encoding issues
    normalizedContent = this.fixEncoding(normalizedContent)

    // Validate OFX format
    if (!normalizedContent.includes("<OFX>") && !normalizedContent.includes("OFXHEADER:")) {
      throw new Error("Arquivo OFX inválido: formato não reconhecido")
    }

    try {
      // Extract account information
      const bankId = this.extractValue(normalizedContent, "BANKID") || ""
      const accountId = this.extractValue(normalizedContent, "ACCTID") || ""
      const accountType = this.extractValue(normalizedContent, "ACCTTYPE") || "CHECKING"

      // Extract date range
      const startDate = this.extractValue(normalizedContent, "DTSTART") || ""
      const endDate = this.extractValue(normalizedContent, "DTEND") || ""

      // Extract transactions
      const transactions = this.extractTransactions(normalizedContent)

      return {
        bankId,
        accountId,
        accountType,
        startDate: this.formatDate(startDate),
        endDate: this.formatDate(endDate),
        transactions,
      }
    } catch (error) {
      throw new Error(`Erro ao processar arquivo OFX: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  private static fixEncoding(content: string): string {
    const encodingFixes: Record<string, string> = {
      "Ã¡": "á",
      "Ã ": "à",
      "Ã¢": "â",
      "Ã£": "ã",
      "Ã¤": "ä",
      "Ã©": "é",
      "Ã¨": "è",
      Ãª: "ê",
      "Ã«": "ë",
      "Ã­": "í",
      "Ã¬": "ì",
      "Ã®": "î",
      "Ã¯": "ï",
      "Ã³": "ó",
      "Ã²": "ò",
      "Ã´": "ô",
      Ãµ: "õ",
      "Ã¶": "ö",
      Ãº: "ú",
      "Ã¹": "ù",
      "Ã»": "û",
      "Ã¼": "ü",
      "Ã§": "ç",
      "Ã±": "ñ",
      Á: "Á",
      À: "À",
      Â: "Â",
      Ã: "Ã",
      Ä: "Ä",
      É: "É",
      È: "È",
      Ê: "Ê",
      Ë: "Ë",
      Í: "Í",
      Ì: "Ì",
      Î: "Î",
      Ï: "Ï",
      Ó: "Ó",
      Ò: "Ò",
      Ô: "Ô",
      Õ: "Õ",
      Ö: "Ö",
      Ú: "Ú",
      Ù: "Ù",
      Û: "Û",
      Ü: "Ü",
      Ç: "Ç",
      Ñ: "Ñ",
    }

    let fixedContent = content
    for (const [wrong, correct] of Object.entries(encodingFixes)) {
      fixedContent = fixedContent.replace(new RegExp(wrong, "g"), correct)
    }

    return fixedContent
  }

  private static extractValue(content: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([^<]+)`, "i")
    const match = content.match(regex)
    return match ? match[1].trim() : null
  }

  private static extractTransactions(content: string): OFXTransaction[] {
    const transactions: OFXTransaction[] = []

    // Find all STMTTRN blocks
    const transactionRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs
    const matches = content.match(transactionRegex)

    console.log("[v0] OFX Parser - Found transaction blocks:", matches?.length || 0)

    if (!matches) {
      return transactions
    }

    matches.forEach((transactionBlock, index) => {
      try {
        const trntype = this.extractValue(transactionBlock, "TRNTYPE") || ""
        const dtposted = this.extractValue(transactionBlock, "DTPOSTED") || ""
        const trnamt = this.extractValue(transactionBlock, "TRNAMT") || "0"
        const fitid = this.extractValue(transactionBlock, "FITID") || `${Date.now()}-${index}`

        const memo = this.extractValue(transactionBlock, "MEMO") || ""
        const name = this.extractValue(transactionBlock, "NAME") || ""
        const payee = this.extractValue(transactionBlock, "PAYEE") || ""
        const checknum = this.extractValue(transactionBlock, "CHECKNUM") || ""
        const refnum = this.extractValue(transactionBlock, "REFNUM") || ""
        const origcurrency = this.extractValue(transactionBlock, "ORIGCURRENCY") || ""
        const inv401ksource = this.extractValue(transactionBlock, "INV401KSOURCE") || ""
        const dtuser = this.extractValue(transactionBlock, "DTUSER") || ""
        const dtavail = this.extractValue(transactionBlock, "DTAVAIL") || ""
        const correctfitid = this.extractValue(transactionBlock, "CORRECTFITID") || ""
        const correctaction = this.extractValue(transactionBlock, "CORRECTACTION") || ""
        const srvrtid = this.extractValue(transactionBlock, "SRVRTID") || ""

        // Try to extract any other text content that might be description
        const allTextContent = transactionBlock
          .replace(/<[^>]+>/g, " ") // Remove all XML tags
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim()

        console.log(`[v0] Transaction ${index + 1} ALL extracted fields:`, {
          trntype,
          dtposted,
          trnamt,
          fitid,
          memo,
          name,
          payee,
          checknum,
          refnum,
          origcurrency,
          inv401ksource,
          dtuser,
          dtavail,
          correctfitid,
          correctaction,
          srvrtid,
          allTextContent: allTextContent.substring(0, 200),
          rawBlock: transactionBlock.substring(0, 300),
        })

        const amount = Number.parseFloat(trnamt)

        let description = ""
        const descriptionParts: string[] = []

        // Primary description sources (in order of preference)
        if (memo && memo.trim()) descriptionParts.push(memo.trim())
        if (name && name.trim() && !descriptionParts.includes(name.trim())) {
          descriptionParts.push(name.trim())
        }
        if (payee && payee.trim() && !descriptionParts.includes(payee.trim())) {
          descriptionParts.push(payee.trim())
        }

        // Additional information
        if (refnum && refnum.trim()) {
          descriptionParts.push(`Ref: ${refnum.trim()}`)
        }
        if (srvrtid && srvrtid.trim()) {
          descriptionParts.push(`ID: ${srvrtid.trim()}`)
        }

        // Join all parts
        description = descriptionParts.join(" - ")

        // If still no description, try to extract from raw text content
        if (!description.trim() && allTextContent) {
          // Look for meaningful text that's not just numbers or common OFX terms
          const meaningfulText = allTextContent
            .split(" ")
            .filter(
              (word) =>
                word.length > 2 &&
                !word.match(/^\d+$/) &&
                !["DEBIT", "CREDIT", "PAYMENT", "DEPOSIT", "TRANSFER", "STMTTRN"].includes(word.toUpperCase()),
            )
            .slice(0, 5) // Take first 5 meaningful words
            .join(" ")

          if (meaningfulText.trim()) {
            description = meaningfulText.trim()
          }
        }

        console.log(`[v0] Transaction ${index + 1} description building result:`, {
          descriptionParts,
          finalDescription: description || "NO DESCRIPTION FOUND",
          allTextContent: allTextContent.substring(0, 100),
        })

        if (!description.trim()) {
          const typeMap: Record<string, string> = {
            DEBIT: "Débito",
            CREDIT: "Crédito",
            PAYMENT: "Pagamento",
            DEPOSIT: "Depósito",
            TRANSFER: "Transferência",
            CHECK: "Cheque",
            ATM: "Caixa Eletrônico",
            POS: "Compra no Cartão",
            XFER: "Transferência",
            REPEATPMT: "Pagamento Recorrente",
            INTEREST: "Juros",
            FEE: "Taxa",
            DIVIDEND: "Dividendo",
          }

          description = typeMap[trntype.toUpperCase()] || `Transação ${trntype || "Desconhecida"}`

          // Add amount info to make it more descriptive
          if (amount !== 0) {
            description += ` - R$ ${Math.abs(amount).toFixed(2)}`
          }
        }

        const transaction = {
          id: fitid,
          date: this.formatDate(dtposted),
          description: description.trim(),
          amount: Math.abs(amount),
          type: amount >= 0 ? "entrada" : "saida",
          fitid,
          memo: memo || description,
        }

        console.log(`[v0] FINAL transaction ${index + 1}:`, transaction)

        transactions.push(transaction)
      } catch (error) {
        console.warn(`Erro ao processar transação ${index + 1}:`, error)
      }
    })

    // Sort transactions by date (newest first)
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private static formatDate(ofxDate: string): string {
    if (!ofxDate) return new Date().toISOString().split("T")[0]

    // OFX dates are typically in format YYYYMMDD or YYYYMMDDHHMMSS
    const dateOnly = ofxDate.substring(0, 8)

    if (dateOnly.length === 8) {
      const year = dateOnly.substring(0, 4)
      const month = dateOnly.substring(4, 6)
      const day = dateOnly.substring(6, 8)

      return `${year}-${month}-${day}`
    }

    return new Date().toISOString().split("T")[0]
  }

  static validateOFXFile(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      if (!file.name.toLowerCase().endsWith(".ofx")) {
        resolve(false)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const isValid = content.includes("<OFX>") || content.includes("OFXHEADER:")
        resolve(isValid)
      }
      reader.onerror = () => resolve(false)
      reader.readAsText(file)
    })
  }
}
