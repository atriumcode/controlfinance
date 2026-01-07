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

if (user.role !== "admin") { 
  redirect("/dashboard")
}

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">Novo Usuário</h1>               
       <NewUserForm companyId={user.company_id} />
    </div>
  )
}
