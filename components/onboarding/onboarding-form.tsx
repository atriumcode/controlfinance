"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  listCompaniesAction,
  associateCompanyOnboardingAction,
} from "@/lib/auth/actions"

type Company = {
  id: string
  name: string
}

export function OnboardingForm() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadCompanies() {
      const res = await listCompaniesAction()
      if (res.success) {
        setCompanies(res.companies)
      }
    }
    loadCompanies()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!companyId) {
      setError("Selecione uma empresa")
      return
    }

    setLoading(true)

    const result = await associateCompanyOnboardingAction({ companyId })

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Empresa</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="">Selecione uma empresa</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded"
      >
        {loading ? "Associando..." : "Continuar"}
      </button>
    </form>
  )
}
