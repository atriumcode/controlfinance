"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateOwnProfileAction } from "@/lib/auth/profile.actions"

interface UserProfileFormProps {
  user: {
    id: string
    email: string
    full_name: string
  }
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const [fullName, setFullName] = useState(user.full_name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await updateOwnProfileAction({
      fullName,
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error || "Erro ao atualizar perfil")
      return
    }

    setSuccess("Perfil atualizado com sucesso")
  }

  return (
    <div className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={user.email} disabled />
      </div>

      <div className="space-y-2">
        <Label>Nome completo</Label>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Salvando..." : "Salvar alterações"}
      </Button>
    </div>
  )
}
