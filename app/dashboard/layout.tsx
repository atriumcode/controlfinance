import { requireAuth } from "@/lib/auth/actions"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  if (!user.company_id) {
    redirect("/dashboard/settings")
  }

  return (
    <div className="flex min-h-screen">
      {children}
    </div>
  )
}
