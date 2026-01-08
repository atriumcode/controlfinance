import { requireAuth } from "@/lib/auth/actions"

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <pre className="bg-muted p-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  )
}
