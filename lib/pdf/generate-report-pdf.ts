import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Client {
  id: string
  name: string
  city: string
  state: string
  document: string
}

interface Invoice {
  id: string
  invoice_number?: string
  total_amount: number
  amount_paid: number | null
  status: string
  issue_date: string
  created_at: string
  client_id: string
  clients?: {
    name: string
    city: string
    state: string
  }
  payments?: Array<{
    payment_date: string
    amount: number
  }>
}

interface GenerateReportPDFOptions {
  invoices: Invoice[]
  clients: Client[]
  groupBy: "client" | "city"
  paymentStatus: string
  selectedCity: string
  selectedClient: string
  userEmail: string
  userName: string
  companyName: string
  companyCnpj: string
  companyAddress: string
  companyCity: string
  companyState: string
  companyLogo: string
}

export function generateReportPDF({
  invoices,
  clients,
  groupBy,
  userEmail,
  userName,
  companyName,
  companyCnpj,
  companyAddress,
  companyCity,
  companyState,
  companyLogo,
}: GenerateReportPDFOptions) {
  const doc = new jsPDF()

  const pageWidth = doc.internal.pageSize.getWidth()

  if (companyLogo) {
    try {
      doc.addImage(companyLogo, "PNG", 14, 10, 30, 30)
    } catch (error) {
      console.error("Error adding logo to PDF:", error)
      // Fallback to placeholder if logo fails to load
      doc.setFillColor(240, 240, 240)
      doc.rect(14, 10, 30, 30, "F")
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text("LOGO", 29, 27, { align: "center" })
    }
  } else {
    // Logo placeholder
    doc.setFillColor(240, 240, 240)
    doc.rect(14, 10, 30, 30, "F")
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text("LOGO", 29, 27, { align: "center" })
  }

  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.setFont("helvetica", "bold")
  doc.text(companyName, 50, 15)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text(`CNPJ: ${companyCnpj}`, 50, 21)

  if (companyAddress) {
    doc.text(companyAddress, 50, 27)
    if (companyCity && companyState) {
      doc.text(`${companyCity}, ${companyState}`, 50, 33)
    }
  }

  doc.setDrawColor(200, 200, 200)
  doc.line(14, 42, pageWidth - 14, 42)

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Relatório de Notas Fiscais", pageWidth / 2, 48, { align: "center" })

  const yPosition = 56

  // Generate report based on grouping
  if (groupBy === "client") {
    generateByClientReport(doc, invoices, clients, yPosition)
  } else {
    generateByCityReport(doc, invoices, clients, yPosition)
  }

  const pageCount = doc.getNumberOfPages()
  const generationDate = new Date().toLocaleString("pt-BR")

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.setFont("helvetica", "normal")

    // Footer line
    doc.setDrawColor(200, 200, 200)
    doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20)

    // Footer text
    doc.text(`Gerado em: ${generationDate}`, 14, pageHeight - 14)
    doc.text(`Usuário: ${userName} (${userEmail})`, 14, pageHeight - 10)
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 14, { align: "right" })
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split("T")[0]
  doc.save(`relatorio-notas-fiscais-${timestamp}.pdf`)
}

function generateByClientReport(doc: jsPDF, invoices: Invoice[], clients: Client[], startY: number) {
  // Group invoices by client
  const invoicesByClient = invoices.reduce(
    (acc, invoice) => {
      const clientId = invoice.client_id
      if (!acc[clientId]) {
        acc[clientId] = []
      }
      acc[clientId].push(invoice)
      return acc
    },
    {} as Record<string, Invoice[]>,
  )

  let currentY = startY

  // Iterate through each client
  Object.entries(invoicesByClient).forEach(([clientId, clientInvoices], index) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) return

    // Add new page if needed
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Cliente: ${client.name}`, 14, currentY)
    currentY += 5
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Cidade: ${client.city}, ${client.state}`, 14, currentY)
    currentY += 3

    // Create table for client's invoices
    const tableData = clientInvoices.map((invoice) => {
      const amountPaid = invoice.amount_paid || 0
      const totalAmount = invoice.total_amount || 0
      let status = "A Receber"
      if (amountPaid >= totalAmount && totalAmount > 0) {
        status = "Pago"
      } else if (amountPaid > 0 && amountPaid < totalAmount) {
        status = "Parcialmente Pago"
      }

      return [
        invoice.invoice_number || invoice.id.slice(0, 8),
        new Date(invoice.issue_date || invoice.created_at).toLocaleDateString("pt-BR"),
        `R$ ${totalAmount.toFixed(2)}`,
        `R$ ${amountPaid.toFixed(2)}`,
        status,
      ]
    })

    autoTable(doc, {
      startY: currentY,
      head: [["Nota Fiscal", "Data Lançamento", "Valor Total", "Valor Pago", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14, right: 14, bottom: 30 },
      styles: { fontSize: 9 },
    })

    currentY = (doc as any).lastAutoTable.finalY + 10
  })
}

function generateByCityReport(doc: jsPDF, invoices: Invoice[], clients: Client[], startY: number) {
  // Group invoices by city
  const invoicesByCity = invoices.reduce(
    (acc, invoice) => {
      const city =
        invoice.clients?.city && invoice.clients?.state
          ? `${invoice.clients.city}, ${invoice.clients.state}`
          : "Sem Cidade"
      if (!acc[city]) {
        acc[city] = []
      }
      acc[city].push(invoice)
      return acc
    },
    {} as Record<string, Invoice[]>,
  )

  let currentY = startY

  // Iterate through each city
  Object.entries(invoicesByCity).forEach(([city, cityInvoices]) => {
    // Add new page if needed
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Cidade: ${city}`, 14, currentY)
    currentY += 6

    // Group by client within the city
    const invoicesByClient = cityInvoices.reduce(
      (acc, invoice) => {
        const clientId = invoice.client_id
        if (!acc[clientId]) {
          acc[clientId] = []
        }
        acc[clientId].push(invoice)
        return acc
      },
      {} as Record<string, Invoice[]>,
    )

    // Iterate through each client in the city
    Object.entries(invoicesByClient).forEach(([clientId, clientInvoices]) => {
      const client = clients.find((c) => c.id === clientId)
      if (!client) return

      // Add new page if needed
      if (currentY > 240) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text(`  Cliente: ${client.name}`, 14, currentY)
      currentY += 3

      // Create table for client's invoices
      const tableData = clientInvoices.map((invoice) => {
        const amountPaid = invoice.amount_paid || 0
        const totalAmount = invoice.total_amount || 0
        let status = "A Receber"
        if (amountPaid >= totalAmount && totalAmount > 0) {
          status = "Pago"
        } else if (amountPaid > 0 && amountPaid < totalAmount) {
          status = "Parcialmente Pago"
        }

        return [
          invoice.invoice_number || invoice.id.slice(0, 8),
          new Date(invoice.issue_date || invoice.created_at).toLocaleDateString("pt-BR"),
          `R$ ${totalAmount.toFixed(2)}`,
          `R$ ${amountPaid.toFixed(2)}`,
          status,
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [["Nota Fiscal", "Data Lançamento", "Valor Total", "Valor Pago", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 14, bottom: 30 },
        styles: { fontSize: 8 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 8
    })

    currentY += 5
  })
}
