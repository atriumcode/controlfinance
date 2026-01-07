import { createClient } from "@supabase/supabase-js"
import { parseNFeXML } from "../lib/utils/nfe-parser"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixInvoiceClients() {
  console.log("[v0] Iniciando correção de vínculos cliente-nota fiscal...")

  // Buscar todas as notas fiscais sem cliente
  const { data: invoices, error: fetchError } = await supabase
    .from("invoices")
    .select("id, invoice_number, xml_content, company_id, client_id")
    .is("client_id", null)

  if (fetchError) {
    console.error("[v0] Erro ao buscar notas fiscais:", fetchError)
    return
  }

  if (!invoices || invoices.length === 0) {
    console.log("[v0] Nenhuma nota fiscal sem cliente encontrada.")
    return
  }

  console.log(`[v0] Encontradas ${invoices.length} notas fiscais sem cliente`)

  let fixed = 0
  let errors = 0

  for (const invoice of invoices) {
    try {
      console.log(`[v0] Processando nota fiscal ${invoice.invoice_number}...`)

      if (!invoice.xml_content) {
        console.log(`[v0] Nota ${invoice.invoice_number} não tem XML armazenado, pulando...`)
        continue
      }

      // Parsear o XML para extrair dados do cliente
      const nfeData = await parseNFeXML(invoice.xml_content)

      if (!nfeData.client) {
        console.log(`[v0] Nota ${invoice.invoice_number} não tem dados de cliente no XML, pulando...`)
        continue
      }

      console.log(`[v0] Cliente encontrado no XML: ${nfeData.client.name}`)

      // Verificar se o cliente já existe
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("company_id", invoice.company_id)
        .eq("document", nfeData.client.document)
        .maybeSingle()

      let clientId: string

      if (existingClient) {
        clientId = existingClient.id
        console.log(`[v0] Cliente existente encontrado: ${clientId}`)
      } else {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert({
            company_id: invoice.company_id,
            name: nfeData.client.name,
            document: nfeData.client.document,
            document_type: nfeData.client.document_type,
            email: nfeData.client.email,
            address: nfeData.client.address,
            city: nfeData.client.city,
            state: nfeData.client.state,
            zip_code: nfeData.client.zip_code,
          })
          .select("id")
          .single()

        if (clientError) {
          console.error(`[v0] Erro ao criar cliente para nota ${invoice.invoice_number}:`, clientError)
          errors++
          continue
        }

        clientId = newClient.id
        console.log(`[v0] Novo cliente criado: ${clientId}`)
      }

      // Atualizar a nota fiscal com o client_id
      const { error: updateError } = await supabase
        .from("invoices")
        .update({ client_id: clientId })
        .eq("id", invoice.id)

      if (updateError) {
        console.error(`[v0] Erro ao atualizar nota ${invoice.invoice_number}:`, updateError)
        errors++
        continue
      }

      console.log(`[v0] Nota ${invoice.invoice_number} vinculada ao cliente ${clientId}`)
      fixed++
    } catch (error) {
      console.error(`[v0] Erro ao processar nota ${invoice.invoice_number}:`, error)
      errors++
    }
  }

  console.log(`[v0] Correção concluída!`)
  console.log(`[v0] Notas corrigidas: ${fixed}`)
  console.log(`[v0] Erros: ${errors}`)
}

fixInvoiceClients()
  .then(() => {
    console.log("[v0] Script finalizado com sucesso")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Erro fatal:", error)
    process.exit(1)
  })
