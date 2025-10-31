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

    const transactionRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs
    const matches = content.match(transactionRegex)

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
        const refnum = this.extractValue(transactionBlock, "REFNUM") || ""
        const srvrtid = this.extractValue(transactionBlock, "SRVRTID") || ""

        const allTextContent = transactionBlock
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()

        const amount = Number.parseFloat(trnamt)

        let description = ""
        const descriptionParts: string[] = []

        if (memo && memo.trim()) descriptionParts.push(memo.trim())
        if (name && name.trim() && !descriptionParts.includes(name.trim())) {
          descriptionParts.push(name.trim())
        }
        if (payee && payee.trim() && !descriptionParts.includes(payee.trim())) {
          descriptionParts.push(payee.trim())
        }

        if (refnum && refnum.trim()) {
          descriptionParts.push(`Ref: ${refnum.trim()}`)
        }
        if (srvrtid && srvrtid.trim()) {
          descriptionParts.push(`ID: ${srvrtid.trim()}`)
        }

        description = descriptionParts.join(" - ")

        if (!description.trim() && allTextContent) {
          const meaningfulText = allTextContent
            .split(" ")
            .filter(
              (word) =>
                word.length > 2 &&
                !word.match(/^\d+$/) &&
                !["DEBIT", "CREDIT", "PAYMENT", "DEPOSIT", "TRANSFER", "STMTTRN"].includes(word.toUpperCase()),
            )
            .slice(0, 5)
            .join(" ")

          if (meaningfulText.trim()) {
            description = meaningfulText.trim()
          }
        }

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

        transactions.push(transaction)
      } catch (error) {
        console.warn(`Erro ao processar transação ${index + 1}:`, error)
      }
    })

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
