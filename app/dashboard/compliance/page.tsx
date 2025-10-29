import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ComplianceOverview } from "@/components/compliance/compliance-overview"
import { ComplianceReports } from "@/components/compliance/compliance-reports"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export default async function CompliancePage() {
  const supabase = createServerClient()

  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

    if (!profile?.company_id) {
      redirect("/dashboard")
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Conformidade Regulatória</h1>
          <p className="text-muted-foreground">
            Monitore e mantenha conformidade com regulamentações fiscais brasileiras
          </p>
        </div>

        <ComplianceOverview companyId={profile.company_id} />
        <ComplianceReports companyId={profile.company_id} />
      </div>
    )
  } catch (error) {
    console.error("[v0] Authentication error in compliance page:", error)
    redirect("/auth/login")
  }
}
