"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Calendar, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface ComplianceReportsProps {
  companyId: string
}

export function ComplianceReports({ companyId }: ComplianceReportsProps) {
  const [selectedReport, setSelectedReport] = useState<string>("monthly")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current")

  const reports = [
    {
      id: "monthly",
      name: "Relatório Mensal de Conformidade",
      description: "Análise completa da conformidade fiscal mensal",
      icon: Calendar,
    },
    {
      id: "nfe",
      name: "Relatório de NF-e",
      description: "Status e conformidade das notas fiscais eletrônicas",
      icon: FileText,
    },
    {
      id: "tax",
      name: "Relatório Fiscal",
      description: "Análise de impostos e obrigações fiscais",
      icon: TrendingUp,
    },
  ]

  const generateReport = async (reportType: string) => {
    // Simulate report generation
    const reportData = {
      company_id: companyId,
      report_type: reportType,
      period: selectedPeriod,
      generated_at: new Date().toISOString(),
      data: {
        summary: "Relatório de conformidade gerado com sucesso",
        compliance_score: 85.5,
        issues_found: 3,
        recommendations: [
          "Regularizar documentação de 2 clientes",
          "Atualizar chaves NF-e pendentes",
          "Revisar cálculos de impostos",
        ],
      },
    }

    // Create downloadable report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-conformidade-${reportType}-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {reports.map((report) => {
              const Icon = report.icon
              return (
                <Card
                  key={report.id}
                  className={`cursor-pointer transition-colors ${
                    selectedReport === report.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{report.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Mês Atual</SelectItem>
                  <SelectItem value="last">Mês Anterior</SelectItem>
                  <SelectItem value="quarter">Trimestre Atual</SelectItem>
                  <SelectItem value="year">Ano Atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => generateReport(selectedReport)} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Gerar Relatório
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{reports.find((r) => r.id === selectedReport)?.name}</h4>
            <p className="text-sm text-muted-foreground">{reports.find((r) => r.id === selectedReport)?.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Período selecionado:{" "}
              {selectedPeriod === "current"
                ? "Mês Atual"
                : selectedPeriod === "last"
                  ? "Mês Anterior"
                  : selectedPeriod === "quarter"
                    ? "Trimestre Atual"
                    : "Ano Atual"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
