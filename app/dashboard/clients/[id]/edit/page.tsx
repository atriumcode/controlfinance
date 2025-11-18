import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ClientForm } from "@/components/clients/client-form"
import { getAuthenticatedUser } from "@/lib/auth/server-auth"

interface EditClientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const supabase = createAdminClient()

  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's company
  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    redirect("/auth/login")
  }

  // Get client data
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single()

  if (!client) {
    redirect("/dashboard/clients")
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="flex-1 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <Link href="/dashboard/clients" className="text-sm text-muted-foreground hover:text-foreground">
            Clientes
          </Link>
          <span className="text-sm text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Editar Cliente</h1>
        </nav>
      </header>

      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Editar Cliente</h2>
            <p className="text-muted-foreground">Atualize as informações do cliente</p>
          </div>
        </div>

        <div className="max-w-2xl">
          <ClientForm client={client} />
        </div>
      </main>
    </div>
  )
}
