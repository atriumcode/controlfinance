import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ClientsTable } from "@/components/clients/clients-table"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { queryMany, queryOne } from "@/lib/db/postgres"

export default async function ClientsPage() {
  const user = await getAuthenticatedUser()

  const profile = await queryOne<{ company_id: string }>("SELECT company_id FROM profiles WHERE id = $1", [user.id])

  if (!profile?.company_id) {
    redirect("/dashboard/settings")
  }

  const clients = await queryMany("SELECT * FROM clients WHERE company_id = $1 ORDER BY created_at DESC", [
    profile.company_id,
  ])

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie seus clientes cadastrados</p>
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
          <Link href="/dashboard/clients/new">Novo Cliente</Link>
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Lista de Clientes</CardTitle>
          <CardDescription className="text-gray-600">
            {clients?.length || 0} cliente{clients?.length !== 1 ? "s" : ""} cadastrado
            {clients?.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {clients && clients.length > 0 ? (
            <ClientsTable clients={clients} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum cliente cadastrado ainda.</p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href="/dashboard/clients/new">Cadastrar Primeiro Cliente</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
