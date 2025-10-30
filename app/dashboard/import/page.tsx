import Link from "next/link"
import { ImportUploader } from "@/components/import/import-uploader"
import { ImportHistory } from "@/components/import/import-history"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function ImportPage() {
  await getAuthenticatedUser()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Importar NF-e</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Importar NF-e</h2>
            <p className="text-muted-foreground">Importe arquivos XML de notas fiscais eletrônicas</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ImportUploader />
          </div>
          <div className="space-y-6">
            <ImportHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
