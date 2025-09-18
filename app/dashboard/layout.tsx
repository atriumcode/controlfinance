import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and company info
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      companies (
        name,
        cnpj
      )
    `)
    .eq("id", data.user.id)
    .single()

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col md:ml-64 min-w-0 overflow-hidden">
        <DashboardHeader companyName={profile?.companies?.name} userName={profile?.full_name || data.user.email} />

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
