"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
import Link from "next/link"
import { getRoleLabel, getRoleDescription, type UserRole } from "@/lib/auth/roles"

interface User {
  id: string
  email: string
  full_name: string
  role: UserRole | null
  created_at: string
  company_id: string
}

interface UserDetailsFormProps {
  user: User
}

export function UserDetailsForm({ user }: UserDetailsFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.full_name || "",
    role: user.role || "administrador",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    console.log("[v0] Updating user with data:", formData)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          role: formData.role,
        }),
      })

      if (!response.ok) throw new Error("Failed to update user")

      setSuccess("Usuário atualizado com sucesso!")
      router.refresh()
    } catch (error: any) {
      console.log("[v0] Update failed:", error.message)
      setError(error.message || "Erro ao atualizar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete user")

      router.push("/dashboard/users?success=user-deleted")
    } catch (error: any) {
      console.log("[v0] Delete failed:", error.message)
      setError(error.message || "Erro ao excluir usuário")
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>Dados básicos do usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm">{user.email}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nível de Acesso</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    (user.role || "administrador") === "administrador"
                      ? "destructive"
                      : (user.role || "administrador") === "escrita"
                        ? "default"
                        : "secondary"
                  }
                >
                  {getRoleLabel(user.role || "administrador")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{getRoleDescription(user.role || "administrador")}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Criado em</Label>
              <p className="text-sm">{new Date(user.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Editar Usuário</CardTitle>
            <CardDescription>Atualize as informações do usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leitura">Leitura - Apenas visualizar dados</SelectItem>
                    <SelectItem value="escrita">Escrita - Visualizar e editar dados</SelectItem>
                    <SelectItem value="administrador">Administrador - Acesso completo</SelectItem>
                  </SelectContent>
                </Select>
                {!user.role && (
                  <p className="text-xs text-muted-foreground">
                    Seu usuário não possui nível de acesso definido. Selecione "Administrador" para ter acesso completo
                    ao sistema.
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
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
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
                </Button>
              </div>
            </form>

            <Separator className="my-6" />

            {/* Danger Zone */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-red-600">Zona de Perigo</h3>
                <p className="text-sm text-muted-foreground">
                  Ações irreversíveis que afetam permanentemente este usuário.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isLoading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Usuário
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o usuário <strong>{user.full_name}</strong>? Esta ação não pode ser
                      desfeita e o usuário perderá acesso ao sistema.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
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
