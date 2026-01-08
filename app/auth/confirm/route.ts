export const dynamic = "force-dynamic"
import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/dashboard"

  if (token_hash && type) {
    const supabase = createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to dashboard after successful confirmation
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirect to login with error if confirmation failed
  return NextResponse.redirect(new URL("/auth/login?error=confirmation_failed", request.url))
}
