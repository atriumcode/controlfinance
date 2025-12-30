import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadDir = path.join(process.cwd(), "uploads", "certificates")
    await fs.promises.mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${file.name}`
    const filePath = path.join(uploadDir, filename)

    await fs.promises.writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      filename,
      url: `/uploads/certificates/${filename}`,
      file_path: `/uploads/certificates/${filename}`,
    })
  } catch (error) {
    console.error("[UPLOAD ERROR]", error)
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
