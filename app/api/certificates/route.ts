import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { company_id, name, description, file_url, file_size, expiration_date, created_by } = body

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("certificates")
      .insert({
        company_id,
        name,
        description,
        file_url,
        file_size,
        expiration_date,
        created_by,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Erro ao criar certidão:", error)
    return NextResponse.json({ error: "Erro ao criar certidão" }, { status: 500 })
  }
}
