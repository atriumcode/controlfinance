import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import Link from "next/link"
import { Building2, CreditCard, Activity } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-1">Painel de controle do sistema</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
          Superusuário
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-500">Empresas ativas</p>
              <Button variant="outline" size="sm" className="w-full border-gray-200 bg-transparent" disabled>
                Gerenciar
              </Button>
              <p className="text-xs text-gray-500 mt-1">Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Planos</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-xs text-gray-500">Planos disponíveis</p>
              <Button variant="outline" size="sm" className="w-full border-gray-200 bg-transparent" disabled>
                Configurar
              </Button>
              <p className="text-xs text-gray-500 mt-1">Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Auditoria</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <p className="text-xs text-gray-500">Eventos hoje</p>
              <Button variant="outline" size="sm" className="w-full border-gray-200 bg-transparent" asChild>
                <Link href="/dashboard/audit">Ver Logs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Configurações do Sistema</CardTitle>
          <CardDescription className="text-gray-600">Configurações globais e manutenção</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">Painel administrativo em desenvolvimento.</div>
        </CardContent>
      </Card>
    </div>
  )
}
