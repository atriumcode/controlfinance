import { createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuditLogsTable } from "@/components/audit/audit-logs-table"
import { AuditStats } from "@/components/audit/audit-stats"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export default async function AuditPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = createAdminClient()

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Auditoria e Conformidade</h1>
        <p className="text-muted-foreground">
          Monitore todas as atividades do sistema e mantenha conformidade regulatória
        </p>
      </div>

      <AuditStats companyId={profile.company_id} />
      <AuditLogsTable companyId={profile.company_id} />
    </div>
  )
}
