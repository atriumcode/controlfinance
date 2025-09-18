"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [existingCompany, setExistingCompany] = useState<{ name: string } | null>(null)
  const [isCheckingCompany, setIsCheckingCompany] = useState(false)
  const router = useRouter()

  const checkExistingCompany = async (cnpjValue: string) => {
    if (!cnpjValue || cnpjValue.length < 14) {
      setExistingCompany(null)
      return
    }

    setIsCheckingCompany(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("companies").select("name").eq("cnpj", cnpjValue).single()

      if (data && !error) {
        setExistingCompany(data)
        setCompanyName(data.name) // Auto-fill company name
      } else {
        setExistingCompany(null)
      }
    } catch (error) {
      setExistingCompany(null)
    } finally {
      setIsCheckingCompany(false)
    }
  }

  const handleCnpjChange = (value: string) => {
    setCnpj(value)
    // Simple debounce - check company after user stops typing
    setTimeout(() => checkExistingCompany(value), 500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Starting registration with data:", {
        email,
        full_name: fullName,
        company_name: companyName,
        cnpj: cnpj,
      })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            company_name: companyName,
            cnpj: cnpj,
          },
        },
      })

      console.log("[v0] Registration response:", { data, error })

      if (error) {
        console.log("[v0] Registration error details:", error)
        throw error
      }

      console.log("[v0] Registration successful, redirecting...")
      router.push("/auth/register-success")
    } catch (error: unknown) {
      console.log("[v0] Caught registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta"
      console.log("[v0] Setting error message:", errorMessage)
      setError(`Database error saving new user: ${errorMessage}`)
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
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      type="text"
                      placeholder="00.000.000/0000-00"
                      required
                      value={cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                    />
                    {isCheckingCompany && <p className="text-sm text-muted-foreground">Verificando empresa...</p>}
                    {existingCompany && (
                      <p className="text-sm text-green-600">
                        ✓ Empresa encontrada: {existingCompany.name}. Você será associado a esta empresa.
                      </p>
                    )}
                    {cnpj && !existingCompany && !isCheckingCompany && cnpj.length >= 14 && (
                      <p className="text-sm text-blue-600">Nova empresa será criada com este CNPJ.</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={!!existingCompany}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
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
