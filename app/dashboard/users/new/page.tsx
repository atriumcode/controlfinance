import { NewUserForm } from "@/components/users/new-user-form"

export const dynamic = "force-dynamic"

export default async function NewUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Usuário</h1>
        <p className="text-muted-foreground">Cadastre um novo usuário no sistema</p>
      </div>

      <NewUserForm />
    </div>
  )
}
