"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUserAction } from "@/lib/auth/actions"

export function NewUserForm() {
  const [role, setRole] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const form = new FormData(e.currentTarget)

    const email = form.get("email") as string
    const password = form.get("password") as string
    const confirmPassword = form.get("confirmPassword") as string
    const fullName = form.get("fullName") as string

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (!role) {
      setError("Selecione um nível de acesso")
      setIsLoading(false)
      return
    }

    // BUSCAR PERFIL LOGADO
    const profileRes = await fetch("/api/user/profile", { cache: "no-store" })
    if (!profileRes.ok) {
      setError("Não foi possível obter a empresa atual.")
      setIsLoading(false)
      return
    }

    const profile = await profileRes.json()

    const result = await registerUserAction({
      email,
      password,
      fullName,
      role,
      companyId: profile.company_id,
    })

    if (!result.success) {
      setError(result.error || "Erro ao criar usuário")
      setIsLoading(false)
      return
    }

    router.push("/dashboard/users?success=user-created")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <Label>Nome Completo</Label>
        <Input name="fullName" required />
      </div>

      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Senha</Label>
          <Input name="password" type="password" required />
        </div>

        <div>
          <Label>Confirmar Senha</Label>
          <Input name="confirmPassword" type="password" required />
        </div>
      </div>

      <div>
        <Label>Nível de acesso</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Leitura</SelectItem>
            <SelectItem value="user">Escrita</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Criando..." : "Criar Usuário"}
      </Button>
    </form>
  )
}
