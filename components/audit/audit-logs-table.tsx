"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AuditLogsTableProps {
  companyId: string
}

interface AuditLog {
  id: string
  action: string
  resource_type: string
  resource_id: string
  user_id: string
  user_email: string
  ip_address: string
  user_agent: string
  severity: "info" | "warning" | "critical"
  details: any
  created_at: string
}

export function AuditLogsTable({ companyId }: AuditLogsTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")

  useEffect(() => {
    async function fetchLogs() {
      const supabase = createBrowserClient()

      try {
        let query = supabase
          .from("audit_logs")
          .select(`
            *,
            profiles!audit_logs_user_id_fkey(email)
          `)
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })
          .limit(100)

        if (severityFilter !== "all") {
          query = query.eq("severity", severityFilter)
        }

        if (actionFilter !== "all") {
          query = query.eq("action", actionFilter)
        }

        if (searchTerm) {
          query = query.or(
            `action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%,user_email.ilike.%${searchTerm}%`,
          )
        }

        const { data, error } = await query

        if (error) throw error

        const formattedLogs =
          data?.map((log) => ({
            ...log,
            user_email: log.profiles?.email || "Sistema",
          })) || []

        setLogs(formattedLogs)
      } catch (error) {
        console.error("Error fetching audit logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [companyId, searchTerm, severityFilter, actionFilter])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "default"
    }
  }

  const exportLogs = async () => {
    const csvContent = [
      ["Data/Hora", "Usuário", "Ação", "Recurso", "Severidade", "IP", "Detalhes"].join(","),
      ...logs.map((log) =>
        [
          format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }),
          log.user_email,
          log.action,
          log.resource_type,
          log.severity,
          log.ip_address,
          JSON.stringify(log.details).replace(/,/g, ";"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  if (loading) {
    return <div>Carregando logs de auditoria...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Logs de Auditoria</CardTitle>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ação, recurso ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="critical">Crítico</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Excluir</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum log de auditoria encontrado</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(log.severity)}>{log.severity.toUpperCase()}</Badge>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground">em {log.resource_type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span>Usuário: {log.user_email}</span>
                  <span className="mx-2">•</span>
                  <span>IP: {log.ip_address}</span>
                  {log.resource_id && (
                    <>
                      <span className="mx-2">•</span>
                      <span>ID: {log.resource_id}</span>
                    </>
                  )}
                </div>

                {log.details && Object.keys(log.details).length > 0 && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Ver detalhes
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
