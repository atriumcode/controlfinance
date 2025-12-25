import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col md:ml-64 min-w-0">
        <DashboardHeader />

        <main className="flex-1 p-4 md:p-6 pt-14 lg:pt-[60px] overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
