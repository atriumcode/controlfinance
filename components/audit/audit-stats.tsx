"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, CheckCircle } from "lucide-react"

interface AuditStatsProps {
  companyId: string
}

interface Stats {
  totalLogs: number
  todayLogs: number
  criticalEvents: number
  complianceScore: number
}

export function AuditStats({ companyId }: AuditStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    todayLogs: 0,
    criticalEvents: 0,
    complianceScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/audit-stats?company_id=${companyId}`)
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching audit stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [companyId])

  if (loading) {
    return <div>Carregando estatísticas...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Registros de auditoria</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hoje</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.todayLogs}</div>
          <p className="text-xs text-muted-foreground">Atividades hoje</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.criticalEvents}</div>
          <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score de Conformidade</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${stats.complianceScore >= 90 ? "text-green-600" : stats.complianceScore >= 70 ? "text-yellow-600" : "text-red-600"}`}
          >
            {stats.complianceScore}%
          </div>
          <p className="text-xs text-muted-foreground">Nível de conformidade</p>
        </CardContent>
      </Card>
    </div>
  )
}
