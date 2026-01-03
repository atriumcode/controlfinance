import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"
import { OnboardingForm } from "@/components/onboarding/onboarding-form"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.company_id) {
    redirect("/dashboard")
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Selecione sua empresa</h1>
      <p className="text-muted-foreground">
        Escolha a empresa à qual você pertence para continuar.
      </p>

      <OnboardingForm />
    </div>
  )
}
