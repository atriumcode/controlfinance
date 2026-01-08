import { requireAuth } from "@/lib/auth/actions"

export default async function HealthPage() {
  await requireAuth()

  return (
    <pre className="p-6">
      {JSON.stringify({ status: "ok" }, null, 2)}
    </pre>
  )
}
