import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] API backup export - starting")
    const supabase = await createServerClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's company
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const companyId = profile.company_id

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

    console.log("[v0] API backup export - completed:", backupData.metadata.total_records, "records")

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
