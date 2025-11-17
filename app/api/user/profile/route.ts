import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

// Impede que o Next tente pré-renderizar:
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const sessionData = await getSession()

    if (!sessionData || !sessionData.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { user } = sessionData

    return NextResponse.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      company_id: user.company_id,
      cnpj: user.cnpj ?? null,
      is_active: user.is_active,
    })
  } catch (error) {
    console.error("Error getting profile:", error)
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    )
  }
}
