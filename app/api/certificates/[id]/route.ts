import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()

    // Buscar a certidão para obter a URL do arquivo
    const { data: certificate } = await supabase.from("certificates").select("file_url").eq("id", params.id).single()

    if (certificate?.file_url) {
      // Deletar arquivo do Vercel Blob
      try {
        await del(certificate.file_url)
      } catch (error) {
        console.error("[v0] Erro ao deletar arquivo do blob:", error)
      }
    }

    // Deletar do banco de dados
    const { error } = await supabase.from("certificates").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro ao deletar certidão:", error)
    return NextResponse.json({ error: "Erro ao deletar certidão" }, { status: 500 })
  }
}
