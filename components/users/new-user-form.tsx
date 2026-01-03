"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerUserAction } from "@/lib/auth/actions"

export function NewUserForm({ companyId }: { companyId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setIsLoading(true)
  setError(null)

  const formData = new FormData(e.currentTarget)

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const fullName = formData.get("fullName") as string

  if (password !== confirmPassword) {
    setError("As senhas não coincidem")
    setIsLoading(false)
    return
  }

  if (password.length < 6) {
    setError("A senha deve ter pelo menos 6 caracteres")
    setIsLoading(false)
    return
  }

  if (!companyId) {
    setError("Empresa inválida. Recarregue a página.")
    setIsLoading(false)
    return
  }

  try {
    const result = await registerUserAction({
      email,
      password,
      fullName,
      role,
      companyId,
    })

    if (!result.success) {
      setError(result.error || "Erro ao criar usuário")
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard/users?success=user-created")
    }, 2000)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    setError(error.message || "Erro inesperado na criação do usuário")
  } finally {
    setIsLoading(false)
  }
}

  if (success) {
    return (
      <>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-green-600">Usuário Criado com Sucesso!</CardTitle>
            <CardDescription>
              O usuário foi criado e um email de confirmação foi enviado. Redirecionando para a lista de usuários...
            </CardDescription>
          </CardHeader>
        </Card>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Preencha os dados para criar um novo usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" name="fullName" placeholder="Digite o nome completo" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="usuario@exemplo.com" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" placeholder="Digite a senha" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme a senha"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leitura">Leitura - Apenas visualizar dados</SelectItem>
                  <SelectItem value="escrita">Escrita - Visualizar e editar dados</SelectItem>
                  <SelectItem value="administrador">Administrador - Acesso completo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Usuário"}
              </Button>
              <Link href="/dashboard/users">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  )
}
