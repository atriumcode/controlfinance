import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Configuração do Supabase não encontrada" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar se já existem usuários
    const { data: existingUsers, error: checkError } = await supabase.from("profiles").select("id").limit(1)

    if (checkError) {
      console.error("[v0] Error checking users:", checkError)
      return NextResponse.json({ error: "Erro ao verificar usuários", details: checkError.message }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({
        message: "Sistema já inicializado. Usuários já existem no banco de dados.",
        usersCount: existingUsers.length,
      })
    }

    // Criar usuário admin
    const adminEmail = "admin@sistema.com"
    const adminPassword = "admin123"
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const { data: newUser, error: insertError } = await supabase
      .from("profiles")
      .insert({
        email: adminEmail,
        password_hash: hashedPassword,
        full_name: "Administrador",
        role: "admin",
        active: true,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error creating admin user:", insertError)
      return NextResponse.json({ error: "Erro ao criar usuário admin", details: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Sistema inicializado com sucesso!",
      admin: {
        email: adminEmail,
        password: adminPassword,
        note: "Por favor, altere a senha após o primeiro login",
      },
    })
  } catch (error: any) {
    console.error("[v0] Init error:", error)
    return NextResponse.json({ error: "Erro ao inicializar sistema", details: error.message }, { status: 500 })
  }
}
