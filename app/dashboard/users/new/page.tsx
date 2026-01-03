import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { NewUserForm } from "@/components/users/new-user-form"

export const dynamic = "force-dynamic"

export default async function NewUserPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
  redirect("/auth/login")
}

if (!user.company_id) {
  redirect("/onboarding")
}


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Novo Usuário</h1>
        <p className="text-muted-foreground">
          Cadastre um novo usuário no sistema
        </p>
      </div>

      <NewUserForm companyId={user.company_id} />
    </div>
  )
}
