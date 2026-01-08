import Link from "next/link"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ClientsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium">Nenhum cliente cadastrado</h3>
        <p className="text-sm text-muted-foreground">
          Comece cadastrando seu primeiro cliente.
        </p>
      </div>

      <Button asChild>
        <Link href="/dashboard/clients/new">
          Novo Cliente
        </Link>
      </Button>
    </div>
  )
}
