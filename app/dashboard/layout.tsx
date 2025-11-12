import type React from "react"
import { requireAuth } from "@/lib/auth/actions"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { query } from "@/lib/db/postgres"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  let company = null
  if (user.company_id) {
    const companyResult = await query("SELECT name, cnpj FROM companies WHERE id = $1", [user.company_id])
    company = companyResult?.rows?.[0] || null
  }

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
      <DashboardSidebar userRole={user.role} />

      <div className="flex flex-1 flex-col md:ml-64 min-w-0">
        <DashboardHeader
          companyName={company?.name || "Empresa"}
          userName={user.full_name || user.email}
          userRole={user.role}
        />

        <main className="flex-1 p-4 md:p-6 pt-14 lg:pt-[60px] overflow-auto">{children}</main>
      </div>
    </div>
  )
}
