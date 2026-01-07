import { createClient } from "@supabase/supabase-js"
import { parseNFeXML } from "../lib/utils/nfe-parser"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function recreateMissingClients() {
  console.log("[v0] Starting to recreate missing clients...")

  // 1. Buscar todas as invoices com client_id
  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("id, invoice_number, client_id, xml_content, company_id")
    .not("client_id", "is", null)

  if (invoicesError) {
    console.error("[v0] Error fetching invoices:", invoicesError)
    return
  }

  console.log(`[v0] Found ${invoices?.length || 0} invoices with client_id`)

  let fixed = 0
  let errors = 0

  for (const invoice of invoices || []) {
    try {
      // 2. Verificar se o cliente existe
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .eq("id", invoice.client_id)
        .single()

      if (client) {
        console.log(`[v0] Client ${invoice.client_id} exists for invoice ${invoice.invoice_number}`)
        continue
      }

      console.log(`[v0] Client ${invoice.client_id} NOT FOUND for invoice ${invoice.invoice_number}`)

      // 3. Cliente não existe, extrair do XML e criar
      if (!invoice.xml_content) {
        console.log(`[v0] No XML content for invoice ${invoice.invoice_number}, skipping`)
        errors++
        continue
      }

      const nfeData = parseNFeXML(invoice.xml_content)

      if (!nfeData.client) {
        console.log(`[v0] No client data in XML for invoice ${invoice.invoice_number}`)
        errors++
        continue
      }

      console.log(`[v0] Creating client from XML:`, nfeData.client)

      // 4. Criar o cliente com o ID correto
      const { error: createError } = await supabase.from("clients").insert({
        id: invoice.client_id, // Usar o mesmo ID que está na invoice
        company_id: invoice.company_id,
        name: nfeData.client.name,
        document: nfeData.client.document,
        document_type: nfeData.client.documentType,
        email: nfeData.client.email || null,
        phone: nfeData.client.phone || null,
        address: nfeData.client.address || null,
        city: nfeData.client.city || null,
        state: nfeData.client.state || null,
        zip_code: nfeData.client.zipCode || null,
      })

      if (createError) {
        console.error(`[v0] Error creating client for invoice ${invoice.invoice_number}:`, createError)
        errors++
      } else {
        console.log(`[v0] Successfully created client ${invoice.client_id} for invoice ${invoice.invoice_number}`)
        fixed++
      }
    } catch (error) {
      console.error(`[v0] Error processing invoice ${invoice.invoice_number}:`, error)
      errors++
    }
  }

  console.log(`[v0] ===== SUMMARY =====`)
  console.log(`[v0] Total invoices processed: ${invoices?.length || 0}`)
  console.log(`[v0] Clients recreated: ${fixed}`)
  console.log(`[v0] Errors: ${errors}`)
}

recreateMissingClients()
