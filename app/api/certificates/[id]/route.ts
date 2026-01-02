import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser()

    if (!user || !user.company?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 🔎 Buscar certidão garantindo a empresa
    const { data: cert, error } = await supabase
      .from("certificates")
      .select("id, file_url")
      .eq("id", params.id)
      .eq("company_id", user.company.id)
      .single()

    if (error || !cert) {
      return NextResponse.json(
        { error: "Certidão não encontrada" },
        { status: 404 }
      )
    }

    // 🗂️ Caminho físico correto
    // file_url = /uploads/certificates/arquivo.pdf
    const fullPath = path.join(
      process.cwd(),
      "public",
      cert.file_url.replace(/^\/+/, "")
    )

    // 🗑️ Apagar arquivo
    try {
      await fs.unlink(fullPath)
    } catch (err) {
      console.warn("[DELETE] Arquivo não encontrado no disco:", fullPath)
    }

    // 🗑️ Apagar registro
    await supabase
      .from("certificates")
      .delete()
      .eq("id", params.id)
      .eq("company_id", user.company.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE CERTIFICATE ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao excluir certidão" },
      { status: 500 }
    )
  }
}
