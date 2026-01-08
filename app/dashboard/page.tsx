import { createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { DashboardCards } from "@/components/dashboard/dashboard-cards"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) redirect("/dashboard/settings")

  // 🔹 FATURAMENTO
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_amount, amount_paid, status")
    .eq("company_id", profile.company_id)

  const total = invoices?.reduce(
    (sum, i) => sum + Number(i.total_amount || 0),
    0
  ) ?? 0

  const received = invoices?.reduce(
    (sum, i) => sum + Number(i.amount_paid || 0),
    0
  ) ?? 0

  return (
    <div className="space-y-6">
      <DashboardCards
        total={total}
        received={received}
        pending={total - received}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentInvoices />
        <QuickActions />
      </div>
    </div>
  )
}
