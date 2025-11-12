import { queryOne } from "@/lib/db/helpers"
import { redirect } from "next/navigation"
import { CompanyForm } from "@/components/settings/company-form"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  const company = await queryOne("SELECT * FROM companies WHERE id = $1", [user.company_id || ""])

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Configure sua empresa e perfil de usuário</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>Configure os dados da sua empresa para emissão de faturas</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyForm company={company} userId={user.id} profileId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência da interface do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSelector />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
