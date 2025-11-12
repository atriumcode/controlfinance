import { query } from "@/lib/db/postgres"
import { notFound } from "next/navigation"
import { UserDetailsForm } from "@/components/users/user-details-form"

export const dynamic = "force-dynamic"

interface UserDetailsPageProps {
  params: {
    id: string
  }
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const result = await query("SELECT * FROM profiles WHERE id = $1", [params.id])
  const user = result.rows[0]

  if (!user) {
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
