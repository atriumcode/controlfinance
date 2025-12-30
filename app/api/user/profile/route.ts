export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const { user, session } = await getSession()

    if (!user || !session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      company_id: user.company.id,
      company_name: user.company_name,
      cnpj: user.cnpj,
      is_active: user.is_active,
    })
  } catch (error) {
    console.error("Error getting profile:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 })
  }
}
