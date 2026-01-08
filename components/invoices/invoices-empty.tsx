import Link from "next/link"
import { FileText, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InvoicesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium">Nenhuma nota fiscal</h3>
        <p className="text-sm text-muted-foreground">
          Você ainda não possui notas fiscais cadastradas.
        </p>
      </div>

      <div className="flex gap-2">
        <Button asChild>
          <Link href="/dashboard/invoices/new">Nova Nota</Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/dashboard/import">
            <Upload className="mr-2 h-4 w-4" />
            Importar XML
          </Link>
        </Button>
      </div>
    </div>
  )
}
