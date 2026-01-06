import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthenticatedUser()

  return (
    <div className="flex min-h-screen min-w-0 bg-background">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Área principal */}
      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <DashboardHeader
          userName={user?.name ?? ""}
          companyName={user?.company?.name ?? ""}
        />

        <main className="flex-1 min-h-0 min-w-0 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
