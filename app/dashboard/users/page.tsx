import { createAdminClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersTable } from "@/components/users/users-table"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const user = await requireAdmin()

  const supabase = createAdminClient()

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("company_id", user.company.id)
    .order("created_at", { ascending: false })

  if (usersError) {
    console.error("Error fetching users:", usersError)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">Gerencie usuários da empresa</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">Adicionar Usuário</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Usuários com acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
