import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CompanyForm } from "@/components/settings/company-form"
import { ThemeSelector } from "@/components/settings/theme-selector"
import { BackupForm } from "@/components/settings/backup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  console.log("[v0] Settings page - loading")

  const user = await getAuthenticatedUser()

  if (!user) {
    console.log("[v0] Settings - no user found, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] Settings - user authenticated:", user.id)

  const supabase = await createServerClient()

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id || "")
    .single()

  console.log("[v0] Settings - user:", !!user, "company:", !!company)

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Configure sua empresa e perfil de usuário</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
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

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup dos Dados</CardTitle>
              <CardDescription>Faça backup e restaure os dados da sua empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <BackupForm companyId={user.company_id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
