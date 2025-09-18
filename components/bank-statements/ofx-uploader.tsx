"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { OFXParser, type OFXData } from "@/lib/utils/ofx-parser"

interface UploadedFile {
  file: File
  status: "uploading" | "success" | "error"
  error?: string
  data?: OFXData
  progress: number
}

interface OFXUploaderProps {
  onUploadComplete: (data: OFXData[]) => void
}

export function OFXUploader({ onUploadComplete }: OFXUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = async (file: File): Promise<void> => {
    const fileId = `${file.name}-${Date.now()}`

    // Add file to state with uploading status
    setUploadedFiles((prev) => [
      ...prev,
      {
        file,
        status: "uploading",
        progress: 0,
      },
    ])

    try {
      // Simulate progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadedFiles((prev) =>
          prev.map((f) => (f.file.name === file.name && f.file.size === file.size ? { ...f, progress } : f)),
        )
      }

      // Validate file format
      const isValid = await OFXParser.validateOFXFile(file)
      if (!isValid) {
        throw new Error("Arquivo OFX inválido ou formato não suportado")
      }

      // Parse OFX content
      const data = await OFXParser.parseFile(file)

      // Complete progress
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name && f.file.size === file.size ? { ...f, status: "success", progress: 100, data } : f,
        ),
      )
    } catch (error) {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file.name === file.name && f.file.size === file.size
            ? {
                ...f,
                status: "error",
                progress: 100,
                error: error instanceof Error ? error.message : "Erro desconhecido",
              }
            : f,
        ),
      )
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true)

    for (const file of acceptedFiles) {
      await processFile(file)
    }

    setIsProcessing(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/x-ofx": [".ofx"],
      "text/plain": [".ofx"],
    },
    multiple: true,
    disabled: isProcessing,
  })

  const handleImportData = () => {
    const successfulUploads = uploadedFiles.filter((f) => f.status === "success" && f.data).map((f) => f.data!)

    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads)
      setUploadedFiles([])
    }
  }

  const clearFiles = () => {
    setUploadedFiles([])
  }

  const successCount = uploadedFiles.filter((f) => f.status === "success").length
  const errorCount = uploadedFiles.filter((f) => f.status === "error").length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Importar Arquivos OFX</CardTitle>
          <CardDescription>
            Faça upload dos arquivos OFX exportados do seu banco para importar as transações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Arraste arquivos OFX aqui ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground">Suporta múltiplos arquivos .ofx</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Status do Upload</CardTitle>
            <CardDescription>
              {successCount > 0 && `${successCount} arquivo(s) processado(s) com sucesso`}
              {errorCount > 0 && ` • ${errorCount} erro(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{uploadedFile.file.name}</span>
                    {uploadedFile.status === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {uploadedFile.status === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(1)} KB</span>
                </div>

                {uploadedFile.status === "uploading" && <Progress value={uploadedFile.progress} className="h-2" />}

                {uploadedFile.status === "success" && uploadedFile.data && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {uploadedFile.data.transactions.length} transações encontradas
                      {uploadedFile.data.startDate &&
                        uploadedFile.data.endDate &&
                        ` • Período: ${new Date(uploadedFile.data.startDate).toLocaleDateString("pt-BR")} a ${new Date(uploadedFile.data.endDate).toLocaleDateString("pt-BR")}`}
                    </AlertDescription>
                  </Alert>
                )}

                {uploadedFile.status === "error" && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadedFile.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            ))}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={clearFiles}>
                Limpar Lista
              </Button>
              {successCount > 0 && <Button onClick={handleImportData}>Importar {successCount} Arquivo(s)</Button>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
