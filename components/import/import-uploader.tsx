"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface UploadedFile {
  file: File
  status: "pending" | "processing" | "success" | "error"
  error?: string
  result?: any
}

export function ImportUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      status: "pending" as const,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/xml": [".xml"],
      "application/xml": [".xml"],
    },
    multiple: true,
  })

  const processFiles = async () => {
    setIsProcessing(true)

    for (let i = 0; i < uploadedFiles.length; i++) {
      const uploadedFile = uploadedFiles[i]
      if (uploadedFile.status !== "pending") continue

      setUploadedFiles((prev) => prev.map((f, index) => (index === i ? { ...f, status: "processing" } : f)))

      try {
        const fileContent = await uploadedFile.file.text()

        const response = await fetch("/api/import/nfe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            xmlContent: fileContent,
            fileName: uploadedFile.file.name,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao processar arquivo")
        }

        setUploadedFiles((prev) =>
          prev.map((f, index) => (index === i ? { ...f, status: "success", result: data.nfe_data } : f)),
        )
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f, index) =>
            index === i
              ? {
                  ...f,
                  status: "error",
                  error: error instanceof Error ? error.message : "Erro ao processar arquivo",
                }
              : f,
          ),
        )
      }
    }

    setIsProcessing(false)
  }

  const clearFiles = () => {
    setUploadedFiles([])
  }

  const pendingFiles = uploadedFiles.filter((f) => f.status === "pending")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivos XML</CardTitle>
          <CardDescription>Arraste e solte ou clique para selecionar arquivos XML de NF-e</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Arraste arquivos XML aqui ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground">Apenas arquivos .xml são aceitos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Carregados</CardTitle>
            <CardDescription>
              {uploadedFiles.length} arquivo{uploadedFiles.length !== 1 ? "s" : ""} carregado
              {uploadedFiles.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((uploadedFile, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                  {uploadedFile.status === "error" && uploadedFile.error && (
                    <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {uploadedFile.status === "pending" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  {uploadedFile.status === "processing" && (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      <span className="text-xs">Processando...</span>
                    </div>
                  )}
                  {uploadedFile.status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {uploadedFile.status === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                </div>
              </div>
            ))}

            {uploadedFiles.some((f) => f.status === "error") && (
              <div className="space-y-2">
                {uploadedFiles
                  .filter((f) => f.status === "error")
                  .map((file, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{file.file.name}:</strong> {file.error}
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            )}

            <div className="flex gap-2">
              {pendingFiles.length > 0 && (
                <Button onClick={processFiles} disabled={isProcessing}>
                  {isProcessing ? "Processando..." : `Processar ${pendingFiles.length} arquivo(s)`}
                </Button>
              )}
              <Button variant="outline" onClick={clearFiles}>
                Limpar Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
