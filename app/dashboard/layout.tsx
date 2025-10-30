import type React from "react"
import { requireAuth } from "@/lib/auth/actions"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  const supabase = createAdminClient()
  const { data: company } = await supabase.from("companies").select("name, cnpj").eq("id", user.company_id).single()

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar userRole={user.role} />

      <div className="flex flex-1 flex-col md:ml-64 min-w-0 overflow-hidden">
        <DashboardHeader
          companyName={company?.name || "Empresa"}
          userName={user.full_name || user.email}
          userRole={user.role}
        />

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
