import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      )
    }

    // Validações básicas
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido" },
        { status: 400 }
      )
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo maior que 3MB" },
        { status: 400 }
      )
    }

    // Diretório de destino
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "certificates"
    )

    // Garante que o diretório existe
    await fs.mkdir(uploadDir, { recursive: true })

    // Nome único
    const timestamp = Date.now()
    const safeName = file.name.replace(/\s+/g, "-")
    const filename = `${timestamp}-${safeName}`

    const filePath = path.join(uploadDir, filename)

    // Salvar arquivo
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    // URL pública
    const fileUrl = `/uploads/certificates/${filename}`

    console.log("[UPLOAD] Arquivo salvo:", fileUrl)

    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[UPLOAD ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
