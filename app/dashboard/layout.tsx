import { ReactNode } from "react"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR */}
      <DashboardSidebar />

      {/* CONTEÚDO */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <Breadcrumb />
          <ThemeSwitcher />
        </header>

        <main className="flex-1 p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
