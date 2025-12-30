export const dynamic = "force-dynamic"
import { createAdminClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    if (!user || !user.company_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = user.company_id
    const supabase = createAdminClient()

    // Export all company data
    const [{ data: company }, { data: profiles }, { data: clients }, { data: invoices }, { data: audit_logs }] =
      await Promise.all([
        supabase.from("companies").select("*").eq("id", companyId).single(),
        supabase.from("profiles").select("*").eq("company_id", companyId),
        supabase.from("clients").select("*").eq("company_id", companyId),
        supabase.from("invoices").select("*").eq("company_id", companyId),
        supabase.from("audit_logs").select("*").eq("company_id", companyId),
      ])

    // Get invoice items for all invoices
    const invoiceIds = invoices?.map((inv) => inv.id) || []
    let invoice_items: any[] = []

    if (invoiceIds.length > 0) {
      const { data: items } = await supabase.from("invoice_items").select("*").in("invoice_id", invoiceIds)
      invoice_items = items || []
    }

    const backupData = {
      company,
      profiles: profiles || [],
      clients: clients || [],
      invoices: invoices || [],
      invoice_items,
      audit_logs: audit_logs || [],
      metadata: {
        backup_date: new Date().toISOString(),
        company_id: companyId,
        total_records:
          (profiles?.length || 0) +
          (clients?.length || 0) +
          (invoices?.length || 0) +
          invoice_items.length +
          (audit_logs?.length || 0) +
          1,
        version: "1.0",
      },
    }

    return NextResponse.json(backupData, {
      headers: {
        "Content-Disposition": `attachment; filename="backup-${company?.name?.replace(/[^a-zA-Z0-9]/g, "_")}-${new Date().toISOString().split("T")[0]}.json"`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Backup export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
