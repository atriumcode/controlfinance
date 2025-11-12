import { ClientForm } from "@/components/clients/client-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function NewClientPage() {
  await getAuthenticatedUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Cliente</h1>
        <p className="text-muted-foreground">Cadastre um novo cliente no sistema</p>
      </div>

      <div className="max-w-2xl">
        <ClientForm />
      </div>
    </div>
  )
}
