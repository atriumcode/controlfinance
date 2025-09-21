import { createServerClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersTable } from "@/components/users/users-table"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
  const user = await requireAdmin()

  console.log("[v0] Current user:", { id: user.id, company_id: user.company_id, role: user.role })

  const supabase = await createServerClient()

  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("company_id", user.company_id)
    .order("created_at", { ascending: false })

  console.log("[v0] Users query result:", { users, usersError, company_id: user.company_id })

  if (usersError) {
    console.error("Error fetching users:", usersError)
  }

  console.log("[v0] Total users found:", users?.length || 0)
  users?.forEach((u, index) => {
    console.log(`[v0] User ${index + 1}:`, { id: u.id, email: u.email, full_name: u.full_name, role: u.role })
  })

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
