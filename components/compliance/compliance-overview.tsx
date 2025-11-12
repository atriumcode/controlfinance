"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, FileText } from "lucide-react"

interface ComplianceOverviewProps {
  companyId: string
}

interface ComplianceData {
  nfeCompliance: number
  taxCompliance: number
  documentationCompliance: number
  overallScore: number
  issues: Array<{
    type: string
    severity: "low" | "medium" | "high"
    description: string
    count: number
  }>
}

export function ComplianceOverview({ companyId }: ComplianceOverviewProps) {
  const [compliance, setCompliance] = useState<ComplianceData>({
    nfeCompliance: 0,
    taxCompliance: 0,
    documentationCompliance: 0,
    overallScore: 0,
    issues: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComplianceData() {
      try {
        const response = await fetch(`/api/compliance?company_id=${companyId}`)
        const data = await response.json()
        setCompliance(data)
      } catch (error) {
        console.error("Error fetching compliance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [companyId])

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    return <XCircle className="h-5 w-5 text-red-600" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return <div>Carregando dados de conformidade...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Score Geral de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getScoreIcon(compliance.overallScore)}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score Geral</span>
                <span className={`text-2xl font-bold ${getScoreColor(compliance.overallScore)}`}>
                  {compliance.overallScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={compliance.overallScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conformidade NF-e</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(compliance.nfeCompliance)}`}>
                {compliance.nfeCompliance.toFixed(1)}%
              </span>
              {getScoreIcon(compliance.nfeCompliance)}
            </div>
            <Progress value={compliance.nfeCompliance} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Faturas com chave NF-e válida</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conformidade Fiscal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(compliance.taxCompliance)}`}>
                {compliance.taxCompliance.toFixed(1)}%
              </span>
              {getScoreIcon(compliance.taxCompliance)}
            </div>
            <Progress value={compliance.taxCompliance} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Faturas pagas em dia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Documentação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${getScoreColor(compliance.documentationCompliance)}`}>
                {compliance.documentationCompliance.toFixed(1)}%
              </span>
              {getScoreIcon(compliance.documentationCompliance)}
            </div>
            <Progress value={compliance.documentationCompliance} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Clientes com documentos válidos</p>
          </CardContent>
        </Card>
      </div>

      {compliance.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questões de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compliance.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(issue.severity)}>{issue.severity.toUpperCase()}</Badge>
                    <div>
                      <p className="font-medium">{issue.type}</p>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">{issue.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
