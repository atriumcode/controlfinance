"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function CreateInvoiceButton() {
  const router = useRouter()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch("/api/user/profile")
      if (!res.ok) return

      const data = await res.json()
      setCompanyId(data.company_id ?? null)
      setLoading(false)
    }

    loadProfile()
  }, [])

  const handleClick = () => {
    if (!companyId) {
      router.push("/dashboard/settings?reason=company-required")
      return
    }

    router.push("/invoices/new")
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="w-full"
    >
      Criar Nova Nota Fiscal
    </Button>
  )
}
