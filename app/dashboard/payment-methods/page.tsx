import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function PaymentMethodsPage() {
  const user = await getAuthenticatedUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Métodos de Pagamento</h2>
          <p className="text-muted-foreground">Configure formas de pagamento aceitas</p>
        </div>
        {/* Removed "Adicionar Método" button since payment methods are hardcoded */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Dinheiro</CardTitle>
            <CardDescription>Pagamento em espécie</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Ativo</span>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PIX</CardTitle>
            <CardDescription>Transferência instantânea</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Ativo</span>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cartão de Crédito</CardTitle>
            <CardDescription>Pagamento com cartão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">Ativo</span>
              <Button variant="outline" size="sm">
                Editar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
