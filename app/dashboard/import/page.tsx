import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

import { ImportUploader } from "@/components/import/import-uploader"
import { ImportHistory } from "@/components/import/import-history"

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Importação de XML"
        description="Importe notas fiscais via arquivo XML e acompanhe o histórico de importações"
      >
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Importar XML
        </Button>
      </PageHeader>

      <ImportUploader />
      <ImportHistory />
    </div>
  )
}
