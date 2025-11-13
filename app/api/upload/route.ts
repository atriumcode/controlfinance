import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Upload API - Iniciando")

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    console.log("[v0] BLOB_READ_WRITE_TOKEN existe:", !!blobToken)

    if (!blobToken) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN não está configurado")
      return NextResponse.json(
        { error: "Serviço de upload não configurado. Verifique as variáveis de ambiente." },
        { status: 503 },
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] Nenhum arquivo encontrado no formData")
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    console.log("[v0] Arquivo recebido:", file.name, "Tipo:", file.type, "Tamanho:", file.size)

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido (${file.type}). Use PNG, JPG, WebP ou GIF.` },
        { status: 400 },
      )
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Tamanho máximo: 2MB" }, { status: 400 })
    }

    console.log("[v0] Iniciando upload para Vercel Blob...")
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
      token: blobToken, // Garantir que o token seja passado explicitamente
    })

    console.log("[v0] Upload concluído com sucesso. URL:", blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[v0] Erro no upload:", error)
    console.error("[v0] Stack trace:", error instanceof Error ? error.stack : "N/A")
    console.error("[v0] Error name:", error instanceof Error ? error.name : "N/A")

    return NextResponse.json(
      {
        error: "Erro ao fazer upload do arquivo",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
