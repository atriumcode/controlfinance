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
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">Gerencie usuários da empresa</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
          <Link href="/dashboard/users/new">Adicionar Usuário</Link>
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Lista de Usuários</CardTitle>
          <CardDescription className="text-gray-600">Usuários com acesso ao sistema</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UsersTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  )
}
