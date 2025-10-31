import { deleteSession } from "@/lib/auth/session"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await deleteSession()

    const redirectUrl = new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 })
  }
}
