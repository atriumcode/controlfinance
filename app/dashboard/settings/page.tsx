import { PageHeader } from "@/components/layout/page-header"
import { CompanyForm } from "@/components/settings/company-form"

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Configurações da empresa e do sistema"
      />

      <CompanyForm />
    </>
  )
}
