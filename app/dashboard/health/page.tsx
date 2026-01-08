import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/server"

export default async function HealthPage() {
  const supabase = createAdminClient({ cookies })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  return (
    <pre style={{ padding: 20 }}>
      {JSON.stringify({ user, error }, null, 2)}
    </pre>
  )
}
