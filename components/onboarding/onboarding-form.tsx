"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCompanyOnboardingAction } from "@/lib/auth/actions"

export function OnboardingForm() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createCompanyOnboardingAction({ name })

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nome da Empresa</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded"
      >
        {loading ? "Criando..." : "Criar Empresa"}
      </button>
    </form>
  )
}
