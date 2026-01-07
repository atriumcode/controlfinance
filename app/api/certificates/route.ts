export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Iniciando criação de certidão")

    const body = await request.json()
    console.log("[v0] Dados recebidos:", body)

    const { company_id, name, description, file_url, file_size, expiration_date, created_by } = body

    // Validar campos obrigatórios
    if (!company_id || !name || !file_url) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      )
   }

    const supabase = createAdminClient()
    console.log("[v0] Cliente Supabase criado")

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        company_id,
        name,
        description: description || null,
        file_url,
        file_size: file_size || null,
        expiration_date: expiration_date || null,
        created_by: created_by || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro do Supabase:", error)
      throw error
    }

    console.log("[v0] Certidão criada com sucesso:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Erro ao criar certidão:", error)
    return NextResponse.json(
      {
        error: "Erro ao criar certidão",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
