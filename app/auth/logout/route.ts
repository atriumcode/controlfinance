import { deleteSession } from "@/lib/auth/session"
import { NextResponse } from "next/server"

export async function POST() {
  console.log("[v0] Logout route called")

  try {
    await deleteSession()

    console.log("[v0] User signed out successfully, redirecting to login")

    const redirectUrl = new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    console.log("[v0] Redirecting to:", redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 })
  }
}
