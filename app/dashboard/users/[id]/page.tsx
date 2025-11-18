import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { UserDetailsForm } from "@/components/users/user-details-form"

export const dynamic = "force-dynamic"

interface UserDetailsPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const supabase = await createServerClient()

  // Fetch user details
  const { data: user, error } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (error || !user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>
        <p className="text-muted-foreground">Visualize e edite informações do usuário</p>
      </div>

      <UserDetailsForm user={user} />
    </div>
  )
}
