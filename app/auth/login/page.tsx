"use client"

import type React from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Receipt, Shield, TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log("[v0] Login page - checking existing user:", {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        confirmed: !!user?.email_confirmed_at,
      })

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, company_id")
          .eq("id", user.id)
          .single()

        console.log("[v0] User profile check:", { profile })

        if (profile) {
          console.log("[v0] User already authenticated with profile, redirecting to dashboard")
          router.replace("/dashboard")
        } else {
          console.log("[v0] User exists but no profile found, staying on login")
        }
      }
    }

    checkUser()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Attempting login for email:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login result:", {
        success: !error,
        hasUser: !!data?.user,
        error: error?.message,
      })

      if (error) throw error

      if (data?.user) {
        console.log("[v0] Login successful, redirecting to dashboard")
        window.location.href = "/dashboard"
      }
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">InvoiceFlow</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Gerencie suas finanças com <span className="text-indigo-400">inteligência</span>
            </h2>
            <p className="text-slate-300 text-lg">
              Controle completo sobre suas notas fiscais, pagamentos e relatórios financeiros em uma plataforma moderna
              e segura.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Gestão de Notas Fiscais</h3>
              <p className="text-slate-400 text-sm">Importe e organize suas NF-e automaticamente</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Relatórios Inteligentes</h3>
              <p className="text-slate-400 text-sm">Análises detalhadas do seu fluxo financeiro</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Segurança Total</h3>
              <p className="text-slate-400 text-sm">Seus dados protegidos com criptografia avançada</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">InvoiceFlow</h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-slate-900 text-center">Bem-vindo</CardTitle>
              <CardDescription className="text-slate-600 text-center text-base">
                Entre com suas credenciais para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-slate-600">
                  Não tem uma conta?{" "}
                  <Link
                    href="/auth/register"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold underline-offset-4 hover:underline"
                  >
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
