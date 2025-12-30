import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function DashboardShell({ children }) {
  const user = await getAuthenticatedUser()

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          userName={user.name}
          companyName={user.company?.name}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
