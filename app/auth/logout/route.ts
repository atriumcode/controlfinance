import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  console.log("[v0] Logout route called")

  try {
    const supabase = await createClient()
    console.log("[v0] Supabase client created for logout")

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] Logout error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] User signed out successfully, redirecting to home")

    const redirectUrl = new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "https://v0-invoice-system-setup.vercel.app/auth/login")
    console.log("[v0] Redirecting to:", redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error("[v0] Logout route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
