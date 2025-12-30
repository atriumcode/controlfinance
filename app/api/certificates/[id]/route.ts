import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { createAdminClient } from "@/lib/supabase/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient()

    const { data: cert, error } = await supabase
      .from("certificates")
      .select("file_path, file_url")
      .eq("id", params.id)
      .single()

    if (error || !cert) {
      return NextResponse.json(
        { error: "Certidão não encontrada" },
        { status: 404 }
      )
    }

    const relativePath = cert.file_path || cert.file_url

    if (!relativePath) {
      return NextResponse.json(
        { error: "Arquivo da certidão não encontrado" },
        { status: 400 }
      )
    }

    const fullPath = path.join(process.cwd(), relativePath)

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath)
    }

    await supabase
      .from("certificates")
      .delete()
      .eq("id", params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE CERTIFICATE ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao excluir certidão" },
      { status: 500 }
    )
  }
}
