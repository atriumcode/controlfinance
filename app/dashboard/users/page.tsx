import { queryMany } from "@/lib/db/helpers"
import { requireAdmin } from "@/lib/auth/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersTable } from "@/components/users/users-table"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const user = await requireAdmin()

  const users = await queryMany(
    "SELECT id, email, full_name, role, created_at FROM profiles WHERE company_id = $1 ORDER BY created_at DESC",
    [user.company_id],
  )

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
