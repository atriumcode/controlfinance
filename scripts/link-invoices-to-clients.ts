import { createClient } from "@supabase/supabase-js"
import { XMLParser } from "fast-xml-parser"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

interface ClientData {
  name: string
  document: string
  documentType: "CPF" | "CNPJ"
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

async function linkInvoicesToClients() {
  console.log("[v0] Starting invoice-client linking process...")

  // Fetch all invoices without client_id
  const { data: invoices, error: fetchError } = await supabase.from("invoices").select("*").is("client_id", null)

  if (fetchError) {
    console.error("[v0] Error fetching invoices:", fetchError)
    return
  }

  if (!invoices || invoices.length === 0) {
    console.log("[v0] No invoices found without client_id")
    return
  }

  console.log(`[v0] Found ${invoices.length} invoices without client_id`)

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    textNodeName: "_text",
  })

  let successCount = 0
  let errorCount = 0

  for (const invoice of invoices) {
    try {
      if (!invoice.xml_content) {
        console.warn(`[v0] Invoice ${invoice.invoice_number} has no XML content, skipping`)
        errorCount++
        continue
      }

      // Parse XML
      const xmlData = parser.parse(invoice.xml_content)
      const nfe = xmlData.nfeProc?.NFe?.infNFe || xmlData.NFe?.infNFe || xmlData.infNFe

      if (!nfe) {
        console.warn(`[v0] Could not parse NFe data for invoice ${invoice.invoice_number}`)
        errorCount++
        continue
      }

      // Extract client data
      const dest = nfe.dest
      if (!dest) {
        console.warn(`[v0] No client data found in XML for invoice ${invoice.invoice_number}`)
        errorCount++
        continue
      }

      const clientDocument = dest.CNPJ || dest.CPF
      const clientName = dest.xNome || dest.xFant || "Cliente Não Identificado"
      const clientEmail = dest.email
      const clientPhone = dest.fone

      const enderDest = dest.enderDest || {}
      const clientAddress = enderDest.xLgr
      const clientCity = enderDest.xMun
      const clientState = enderDest.UF
      const clientZipCode = enderDest.CEP

      if (!clientDocument) {
        console.warn(`[v0] No client document found for invoice ${invoice.invoice_number}`)
        errorCount++
        continue
      }

      const clientData: ClientData = {
        name: clientName,
        document: String(clientDocument).padStart(dest.CNPJ ? 14 : 11, "0"),
        documentType: dest.CNPJ ? "CNPJ" : "CPF",
        email: clientEmail,
        phone: clientPhone,
        address: clientAddress,
        city: clientCity,
        state: clientState,
        zipCode: clientZipCode,
      }

      console.log(
        `[v0] Processing invoice ${invoice.invoice_number} for client ${clientData.name} (${clientData.document})`,
      )

      // Find or create client
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("company_id", invoice.company_id)
        .eq("document", clientData.document)
        .single()

      let clientId: string

      if (existingClient) {
        clientId = existingClient.id
        console.log(`[v0] Found existing client ${clientData.name} (${clientId})`)
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            company_id: invoice.company_id,
            name: clientData.name,
            document: clientData.document,
            document_type: clientData.documentType,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            city: clientData.city,
            state: clientData.state,
            zip_code: clientData.zipCode,
          })
          .select("id")
          .single()

        if (clientError || !newClient) {
          console.error(`[v0] Error creating client for invoice ${invoice.invoice_number}:`, clientError)
          errorCount++
          continue
        }

        clientId = newClient.id
        console.log(`[v0] Created new client ${clientData.name} (${clientId})`)
      }

      // Update invoice with client_id
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ client_id: clientId })
        .eq("id", invoice.id)

      if (updateError) {
        console.error(`[v0] Error updating invoice ${invoice.invoice_number}:`, updateError)
        errorCount++
        continue
      }

      console.log(`[v0] Successfully linked invoice ${invoice.invoice_number} to client ${clientData.name}`)
      successCount++
    } catch (error) {
      console.error(`[v0] Error processing invoice ${invoice.invoice_number}:`, error)
      errorCount++
    }
  }

  console.log("\n[v0] ===== SUMMARY =====")
  console.log(`[v0] Total invoices processed: ${invoices.length}`)
  console.log(`[v0] Successfully linked: ${successCount}`)
  console.log(`[v0] Errors: ${errorCount}`)
  console.log("[v0] ===================\n")

  if (successCount > 0) {
    console.log("[v0] ✓ Invoices have been successfully linked to clients!")
    console.log("[v0] Refresh the Notas Fiscais page to see them grouped by city and client.")
  }
}

// Run the script
linkInvoicesToClients()
