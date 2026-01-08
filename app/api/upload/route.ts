import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
    }

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

    const supabase = createAdminClient()

    const ext = file.name.split(".").pop()
    const safeName = file.name.replace(/\s+/g, "-")
    const filePath = `certificates/${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("[UPLOAD ERROR]", uploadError)
      throw uploadError
    }

    const { data } = supabase.storage
      .from("certificates")
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: data.publicUrl,
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
