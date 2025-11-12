import { execute } from "@/lib/db/postgres"

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
    const auditLog = {
      action: data.action,
      resource_type: data.resource_type,
      resource_id: data.resource_id || null,
      user_id: data.user_id,
      company_id: data.company_id,
      severity: data.severity || "info",
      ip_address: data.ip_address || "unknown",
      user_agent: data.user_agent || "unknown",
      details: data.details ? JSON.stringify(data.details) : null,
      created_at: new Date().toISOString(),
    }

    await execute(
      `INSERT INTO audit_logs (action, resource_type, resource_id, user_id, company_id, severity, ip_address, user_agent, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        auditLog.action,
        auditLog.resource_type,
        auditLog.resource_id,
        auditLog.user_id,
        auditLog.company_id,
        auditLog.severity,
        auditLog.ip_address,
        auditLog.user_agent,
        auditLog.details,
        auditLog.created_at,
      ],
    )
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
