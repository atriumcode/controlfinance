import { createAdminClient } from "@/lib/supabase/server"

export interface AuditLogData {
  action: string
  resource_type: string
  resource_id?: string
  user_id: string
  company_id: string
  ip_address?: string
  user_agent?: string
  severity?: "info" | "warning" | "critical"
  details?: Record<string, any>
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const supabase = createAdminClient()

    const auditLog = {
      ...data,
      severity: data.severity || "info",
      ip_address: data.ip_address || "unknown",
      user_agent: data.user_agent || "unknown",
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("audit_logs").insert([auditLog])

    if (error) {
      console.error("Error creating audit log:", error)
    }
  } catch (error) {
    console.error("Error in createAuditLog:", error)
  }
}

// Helper functions for common audit actions
export const auditActions = {
  async logLogin(userId: string, companyId: string, ipAddress?: string) {
    await createAuditLog({
      action: "login",
      resource_type: "auth",
      user_id: userId,
      company_id: companyId,
      ip_address: ipAddress,
      severity: "info",
    })
  },

  async logLogout(userId: string, companyId: string, ipAddress?: string) {
    await createAuditLog({
      action: "logout",
      resource_type: "auth",
      user_id: userId,
      company_id: companyId,
      ip_address: ipAddress,
      severity: "info",
    })
  },

  async logInvoiceCreate(userId: string, companyId: string, invoiceId: string, details?: any) {
    await createAuditLog({
      action: "create",
      resource_type: "invoice",
      resource_id: invoiceId,
      user_id: userId,
      company_id: companyId,
      severity: "info",
      details,
    })
  },

  async logInvoiceUpdate(userId: string, companyId: string, invoiceId: string, details?: any) {
    await createAuditLog({
      action: "update",
      resource_type: "invoice",
      resource_id: invoiceId,
      user_id: userId,
      company_id: companyId,
      severity: "info",
      details,
    })
  },

  async logInvoiceDelete(userId: string, companyId: string, invoiceId: string, details?: any) {
    await createAuditLog({
      action: "delete",
      resource_type: "invoice",
      resource_id: invoiceId,
      user_id: userId,
      company_id: companyId,
      severity: "warning",
      details,
    })
  },

  async logPaymentCreate(userId: string, companyId: string, paymentId: string, details?: any) {
    await createAuditLog({
      action: "create",
      resource_type: "payment",
      resource_id: paymentId,
      user_id: userId,
      company_id: companyId,
      severity: "info",
      details,
    })
  },

  async logNfeImport(userId: string, companyId: string, fileName: string, details?: any) {
    await createAuditLog({
      action: "import",
      resource_type: "nfe",
      resource_id: fileName,
      user_id: userId,
      company_id: companyId,
      severity: "info",
      details,
    })
  },

  async logSecurityEvent(userId: string, companyId: string, eventType: string, details?: any) {
    await createAuditLog({
      action: eventType,
      resource_type: "security",
      user_id: userId,
      company_id: companyId,
      severity: "critical",
      details,
    })
  },
}
