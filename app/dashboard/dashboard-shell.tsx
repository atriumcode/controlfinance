import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company:companies(name), full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />

      <div className="flex flex-1 flex-col md:ml-64 min-w-0">
        <DashboardHeader
          companyName={profile?.company?.name ?? ""}
          userName={profile?.full_name ?? "Usuário"}
        />

        <main className="flex-1 p-4 pt-14">
          {children}
        </main>
      </div>
    </div>
  )
}
