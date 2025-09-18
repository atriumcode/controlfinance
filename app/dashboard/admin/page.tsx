import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Administração</h2>
          <p className="text-muted-foreground">Painel de controle do sistema</p>
        </div>
        <Badge variant="secondary">Superusuário</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gerenciar empresas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Empresas ativas</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planos</CardTitle>
            <CardDescription>Configurar planos de assinatura</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Planos disponíveis</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auditoria</CardTitle>
            <CardDescription>Logs de sistema e atividades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Eventos hoje</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Ver Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>Configurações globais e manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Painel administrativo em desenvolvimento.</div>
        </CardContent>
      </Card>
    </div>
  )
}
