import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ClientsTable } from "@/components/clients/clients-table"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export default async function ClientsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/login")
  }

  const supabase = createAdminClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.company_id) {
    redirect("/dashboard/settings")
  }

  const { data: clients, error: clientsError } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false })

  if (clientsError) {
    throw new Error("Erro ao carregar clientes")
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Clientes</h1>
        </nav>
        <Button asChild>
          <Link href="/dashboard/clients/new">Novo Cliente</Link>
        </Button>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            <p className="text-muted-foreground">Gerencie seus clientes cadastrados</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientsTable clients={clients} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
