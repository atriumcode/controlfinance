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
}

export function generateReportPDF({
  invoices,
  clients,
  groupBy,
  paymentStatus,
  selectedCity,
  selectedClient,
}: GenerateReportPDFOptions) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text("Relatório de Notas Fiscais", 14, 20)

  // Add filter information
  doc.setFontSize(10)
  let yPosition = 30

  doc.text("Filtros Aplicados:", 14, yPosition)
  yPosition += 6

  // Payment status filter
  const statusLabels: Record<string, string> = {
    all: "Todos",
    paid: "Pago",
    pending: "A Receber",
    partial: "Parcialmente Pago",
  }
  doc.text(`Status: ${statusLabels[paymentStatus] || "Todos"}`, 14, yPosition)
  yPosition += 5

  // City filter
  if (selectedCity !== "all") {
    doc.text(`Município: ${selectedCity}`, 14, yPosition)
    yPosition += 5
  }

  // Client filter
  if (selectedClient !== "all") {
    const client = clients.find((c) => c.id === selectedClient)
    if (client) {
      doc.text(`Cliente: ${client.name}`, 14, yPosition)
      yPosition += 5
    }
  }

  doc.text(`Agrupamento: ${groupBy === "client" ? "Por Cliente" : "Por Cidade"}`, 14, yPosition)
  yPosition += 10

  // Generate report based on grouping
  if (groupBy === "client") {
    generateByClientReport(doc, invoices, clients, yPosition)
  } else {
    generateByCityReport(doc, invoices, clients, yPosition)
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

    // Client header
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`Cliente: ${client.name}`, 14, currentY)
    currentY += 5
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Cidade: ${client.city}, ${client.state}`, 14, currentY)
    currentY += 8

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
      margin: { left: 14 },
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

    // City header
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`Cidade: ${city}`, 14, currentY)
    currentY += 10

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

      // Client subheader
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(`  Cliente: ${client.name}`, 14, currentY)
      currentY += 6

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
        margin: { left: 20 },
        styles: { fontSize: 8 },
      })

      currentY = (doc as any).lastAutoTable.finalY + 8
    })

    currentY += 5
  })
}
