import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { CompanyForm } from "@/components/settings/company-form"

export default async function SettingsPage() {
  const user = await getAuthenticatedUser()

  // ✅ AQUI ESTÁ A CHAVE
  if (!user || !user.company_id) {
    redirect("/dashboard")
  }

  const supabase = createAdminClient()

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", user.company_id)
    .single()

  if (error || !company) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Configure sua empresa e preferências do sistema
        </p>
      </div>

      {/* 🔥 Agora o formulário recebe dados reais */}
      <CompanyForm company={company} />
    </div>
  )
}
