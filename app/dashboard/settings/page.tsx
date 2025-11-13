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

  let company = null
  if (user.company_id && user.company_id.length > 0) {
    company = await queryOne("SELECT * FROM companies WHERE id = $1", [user.company_id])
  }

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Configure sua empresa e perfil de usuário</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-gray-100 border border-gray-200">
          <TabsTrigger value="company" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Empresa
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Aparência
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Informações da Empresa</CardTitle>
              <CardDescription className="text-gray-600">
                Configure os dados da sua empresa para emissão de faturas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <CompanyForm company={company} userId={user.id} profileId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900">Aparência</CardTitle>
              <CardDescription className="text-gray-600">
                Personalize a aparência da interface do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ThemeSelector />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
