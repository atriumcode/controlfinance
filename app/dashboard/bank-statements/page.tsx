"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, FileText } from "lucide-react"
import { OFXUploader } from "@/components/bank-statements/ofx-uploader"
import { TransactionsTable } from "@/components/bank-statements/transactions-table"
import type { OFXData, OFXTransaction } from "@/lib/utils/ofx-parser"
import { toast } from "sonner"

interface ImportedFile {
  id: string
  filename: string
  uploadDate: string
  uploadedBy: string
  transactionCount: number
  bankId: string
  accountId: string
}

export default function BankStatementsPage() {
  const [transactions, setTransactions] = useState<OFXTransaction[]>([])
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load existing data on component mount
  useEffect(() => {
    loadBankStatements()
  }, [])

  const loadBankStatements = async () => {
    try {
      setIsLoading(true)
      // Here you would fetch from your database
      // For now, we'll start with empty arrays
      const mockTransactions: OFXTransaction[] = []

      const mockFiles: ImportedFile[] = []

      setTransactions(mockTransactions)
      setImportedFiles(mockFiles)
    } catch (error) {
      toast.error("Erro ao carregar extratos bancários")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = async (ofxDataArray: OFXData[]) => {
    try {
      const newTransactions: OFXTransaction[] = []
      const newFiles: ImportedFile[] = []

      for (const ofxData of ofxDataArray) {
        // Check for duplicate transactions
        const existingFitIds = transactions.map((t) => t.fitid)
        const uniqueTransactions = ofxData.transactions.filter((t) => !existingFitIds.includes(t.fitid))

        if (uniqueTransactions.length === 0) {
          toast.warning(`Arquivo ${ofxData.bankId} - ${ofxData.accountId}: Todas as transações já foram importadas`)
          continue
        }

        // Add unique transactions
        newTransactions.push(...uniqueTransactions)

        // Create file record
        const fileRecord: ImportedFile = {
          id: `${Date.now()}-${Math.random()}`,
          filename: `extrato_${ofxData.bankId}_${ofxData.accountId}.ofx`,
          uploadDate: new Date().toISOString().split("T")[0],
          uploadedBy: "Usuário Atual", // This would come from auth context
          transactionCount: uniqueTransactions.length,
          bankId: ofxData.bankId,
          accountId: ofxData.accountId,
        }
        newFiles.push(fileRecord)

        // Here you would save to database
        // await saveBankStatements(uniqueTransactions, fileRecord)
      }

      if (newTransactions.length > 0) {
        setTransactions((prev) => [...prev, ...newTransactions])
        setImportedFiles((prev) => [...prev, ...newFiles])
        toast.success(`${newTransactions.length} transações importadas com sucesso!`)
      }
    } catch (error) {
      toast.error("Erro ao processar arquivos OFX")
    }
  }

  const totalEntradas = transactions.filter((t) => t.type === "entrada").reduce((sum, t) => sum + t.amount, 0)

  const totalSaidas = transactions.filter((t) => t.type === "saida").reduce((sum, t) => sum + t.amount, 0)

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando extratos bancários...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Extratos Bancários</h2>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalEntradas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalSaidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalEntradas - totalSaidas >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              R$ {(totalEntradas - totalSaidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Transações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para organizar conteúdo */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="import">Importar OFX</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTable transactions={transactions} />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <OFXUploader onUploadComplete={handleUploadComplete} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Importações</CardTitle>
              <CardDescription>Arquivos OFX importados anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              {importedFiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum arquivo importado ainda.</p>
              ) : (
                <div className="space-y-3">
                  {importedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.filename}</p>
                          <p className="text-sm text-muted-foreground">
                            Banco: {file.bankId} • Conta: {file.accountId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {file.transactionCount} transações • Importado em{" "}
                            {new Date(file.uploadDate).toLocaleDateString("pt-BR")} por {file.uploadedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{file.transactionCount}</div>
                        <div className="text-xs text-muted-foreground">transações</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
