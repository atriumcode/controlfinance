"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Trash2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { updateUserAction, deleteUserAction } from "@/lib/auth/user.actions"
import { getRoleLabel, getRoleDescription, type UserRole } from "@/lib/auth/roles"

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  company_id: string
}

interface UserDetailsFormProps {
  user: User
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "viewer", label: "Leitura – Apenas visualizar dados" },
  { value: "user", label: "Escrita – Visualizar e editar dados" },
  { value: "admin", label: "Administrador – Acesso completo" },
]

export function UserDetailsForm({ user }: UserDetailsFormProps) {
  const router = useRouter()

  const [fullName, setFullName] = useState(user.full_name)
  const [role, setRole] = useState<UserRole>(user.role ?? "viewer")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const result = await updateUserAction({
      userId: user.id,
      fullName,
      role,
    })

    setIsLoading(false)

    if (!result.success) {
      setError(result.error || "Erro ao atualizar usuário")
      return
    }

    setSuccess("Usuário atualizado com sucesso!")
    router.refresh()
  }

  async function handleDelete() {
    setIsLoading(true)
    setError(null)

    const result = await deleteUserAction(user.id)

    if (!result.success) {
      setError(result.error || "Erro ao excluir usuário")
      setIsLoading(false)
      return
    }

    router.push("/dashboard/users?success=user-deleted")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INFORMAÇÕES DO USUÁRIO */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>Dados básicos do usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-sm">{user.email}</p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">
                Nível de Acesso
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    role === "admin"
                      ? "destructive"
                      : role === "user"
                      ? "default"
                      : "secondary"
                  }
                >
                  {getRoleLabel(role)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getRoleDescription(role)}
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Criado em</Label>
              <p className="text-sm">
                {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FORMULÁRIO DE EDIÇÃO */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Usuário</CardTitle>
            <CardDescription>
              Atualize as informações do usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
              </div>
            </form>

            <Separator className="my-6" />

            {/* ZONA DE PERIGO */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-red-600">
                  Zona de Perigo
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ações irreversíveis que afetam permanentemente este usuário.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Usuário
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirmar Exclusão
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o usuário{" "}
                      <strong>{user.full_name}</strong>? Esta ação não pode ser
                      desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
