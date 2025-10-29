"use client"

import type React from "react"
import { registerUserAction } from "@/lib/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)

    console.log("[v0] Client - Starting registration")
    console.log("[v0] Client - Email:", formData.get("email"))
    console.log("[v0] Client - Full Name:", formData.get("fullName"))
    console.log("[v0] Client - Role:", formData.get("role"))
    console.log("[v0] Client - Password length:", (formData.get("password") as string)?.length)

    try {
      console.log("[v0] Client - Calling registerUserAction...")
      const result = await registerUserAction(formData)
      console.log("[v0] Client - Registration result:", result)

      if (!result.success) {
        console.log("[v0] Client - Registration failed:", result.error)
        if (result.details) {
          console.log("[v0] Client - Error details:", result.details)
        }
        setError(result.error || "Erro ao criar conta")
      } else {
        console.log("[v0] Client - Registration successful!")
        if (result.isFirstUser) {
          console.log("[v0] Client - This is the first user (admin)")
          setSuccessMessage("Primeira conta criada! Você é o administrador do sistema.")
        }
        setTimeout(() => router.push("/dashboard"), 1500)
      }
    } catch (error) {
      console.error("[v0] Client - Registration exception:", error)
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Cadastro</CardTitle>
              <CardDescription>Crie sua conta para gerenciar suas notas fiscais</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input id="fullName" name="fullName" type="text" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Função</Label>
                    <Select name="role" defaultValue="admin">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="accountant">Contador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
                    <Input id="cnpj" name="cnpj" type="text" placeholder="00.000.000/0000-00" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nome da Empresa (Opcional)</Label>
                    <Input id="companyName" name="companyName" type="text" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                  </div>
                  {successMessage && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{successMessage}</div>
                  )}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Já tem uma conta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4">
                    Faça login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
