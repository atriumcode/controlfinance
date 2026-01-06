import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { redirect } from "next/navigation"
import { UserProfileForm } from "@/components/users/user-profile-form"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais
        </p>
      </div>

      <UserProfileForm user={user} />
    </div>
  )
}
