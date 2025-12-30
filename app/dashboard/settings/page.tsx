import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CompanyForm } from "@/components/settings/company-form"

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  // 🔒 Redirect APENAS se não estiver autenticado
  if (!user) {
    redirect("/login")
  }

  const supabase = createAdminClient()

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure sua empresa e preferências do sistema
        </p>
      </div>

      {error || !company ? (
        <div className="rounded-lg border border-destructive p-4 text-sm text-destructive">
          Não foi possível carregar os dados da empresa.
        </div>
      ) : (
        <CompanyForm company={company} />
      )}
    </div>
  )
}
