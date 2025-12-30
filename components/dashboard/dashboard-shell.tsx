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
    <div className="min-h-screen md:pl-64">
      <DashboardSidebar />

      <div className="flex min-h-screen flex-col">
        <DashboardHeader
          userName={user.name}
          companyName={user.company?.name}
        />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
