"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, Database, Calendar, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BackupFormProps {
  companyId?: string
}

interface BackupData {
  company: any
  profiles: any[]
  clients: any[]
  invoices: any[]
  invoice_items: any[]
  audit_logs: any[]
  metadata: {
    backup_date: string
    company_id: string
    total_records: number
    version: string
  }
}

export function BackupForm({ companyId }: BackupFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const exportData = async () => {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      console.log("[v0] Starting database backup for company:", companyId)
      const supabase = createBrowserClient()

      // Export company data
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single()

      if (companyError) throw companyError

      // Export profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", companyId)

      if (profilesError) throw profilesError

      // Export clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("company_id", companyId)

      if (clientsError) throw clientsError

      // Export invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .eq("company_id", companyId)

      if (invoicesError) throw invoicesError

      // Export invoice items
      const invoiceIds = invoices?.map((inv) => inv.id) || []
      let invoice_items: any[] = []

      if (invoiceIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from("invoice_items")
          .select("*")
          .in("invoice_id", invoiceIds)

        if (itemsError) throw itemsError
        invoice_items = items || []
      }

      // Export audit logs
      const { data: audit_logs, error: auditError } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("company_id", companyId)

      if (auditError) throw auditError

      const totalRecords =
        (profiles?.length || 0) +
        (clients?.length || 0) +
        (invoices?.length || 0) +
        (invoice_items?.length || 0) +
        (audit_logs?.length || 0) +
        1

      const backupData: BackupData = {
        company,
        profiles: profiles || [],
        clients: clients || [],
        invoices: invoices || [],
        invoice_items,
        audit_logs: audit_logs || [],
        metadata: {
          backup_date: new Date().toISOString(),
          company_id: companyId,
          total_records: totalRecords,
          version: "1.0",
        },
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `backup-${company.name.replace(/[^a-zA-Z0-9]/g, "_")}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log("[v0] Backup completed successfully:", totalRecords, "records")
      toast({
        title: "Backup Concluído",
        description: `${totalRecords} registros exportados com sucesso!`,
      })
    } catch (error) {
      console.error("Error creating backup:", error)
      toast({
        title: "Erro no Backup",
        description: "Erro ao criar backup dos dados",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string) as BackupData
        await restoreData(backupData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Arquivo de backup inválido",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const restoreData = async (backupData: BackupData) => {
    if (!companyId) {
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive",
      })
      return
    }

    setRestoring(true)
    try {
      console.log("[v0] Starting data restoration for company:", companyId)
      const supabase = createBrowserClient()

      // Validate backup data
      if (!backupData.metadata || backupData.metadata.company_id !== companyId) {
        throw new Error("Backup não pertence a esta empresa")
      }

      let restoredCount = 0

      // Restore clients (if they don't exist)
      if (backupData.clients?.length > 0) {
        for (const client of backupData.clients) {
          const { error } = await supabase
            .from("clients")
            .upsert({ ...client, company_id: companyId }, { onConflict: "company_id,document" })

          if (!error) restoredCount++
        }
      }

      // Restore invoices (if they don't exist)
      if (backupData.invoices?.length > 0) {
        for (const invoice of backupData.invoices) {
          const { error } = await supabase
            .from("invoices")
            .upsert({ ...invoice, company_id: companyId }, { onConflict: "company_id,invoice_number" })

          if (!error) restoredCount++
        }
      }

      // Restore invoice items
      if (backupData.invoice_items?.length > 0) {
        const { error } = await supabase.from("invoice_items").upsert(backupData.invoice_items)

        if (!error) restoredCount += backupData.invoice_items.length
      }

      console.log("[v0] Data restoration completed:", restoredCount, "records restored")
      toast({
        title: "Restauração Concluída",
        description: `${restoredCount} registros restaurados com sucesso!`,
      })
    } catch (error) {
      console.error("Error restoring backup:", error)
      toast({
        title: "Erro na Restauração",
        description: error instanceof Error ? error.message : "Erro ao restaurar dados",
        variant: "destructive",
      })
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Dados
          </CardTitle>
          <CardDescription>Faça o download de todos os dados da sua empresa em formato JSON</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">Backup Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Inclui empresa, clientes, faturas, itens e logs de auditoria
                </p>
              </div>
            </div>
            <Button onClick={exportData} disabled={loading || !companyId}>
              {loading ? "Exportando..." : "Exportar"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm font-medium">Empresa</p>
              <Badge variant="secondary">1 registro</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium">Clientes</p>
              <Badge variant="secondary">Todos</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <p className="text-sm font-medium">Faturas</p>
              <Badge variant="secondary">Todas</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Logs</p>
              <Badge variant="secondary">Todos</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Restaurar Dados
          </CardTitle>
          <CardDescription>Restaure dados de um arquivo de backup anterior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium">Selecionar Arquivo</h4>
                <p className="text-sm text-muted-foreground">Escolha um arquivo de backup JSON para restaurar</p>
              </div>
            </div>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="backup-file"
                disabled={restoring || !companyId}
              />
              <Button asChild variant="outline" disabled={restoring || !companyId}>
                <label htmlFor="backup-file" className="cursor-pointer">
                  {restoring ? "Restaurando..." : "Selecionar Arquivo"}
                </label>
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Importante</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• A restauração não substitui dados existentes</li>
              <li>• Apenas dados novos ou atualizados serão importados</li>
              <li>• O backup deve pertencer à mesma empresa</li>
              <li>• Recomendamos fazer um backup antes de restaurar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
