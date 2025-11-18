"use client"
import { loginUserAction } from "@/lib/auth/actions"
import type React from "react"

import { useEffect } from "react"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Receipt, Shield, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    const errorCode = searchParams.get("error_code")
    const errorDescription = searchParams.get("error_description")
    const message = searchParams.get("message")

    if (errorParam) {
      let errorMessage = "Erro na autenticação"

      if (errorCode === "otp_expired") {
        errorMessage = "O link de confirmação expirou. Solicite um novo link de confirmação."
      } else if (errorParam === "access_denied") {
        errorMessage = "Acesso negado. Verifique se você confirmou seu email."
      } else if (errorParam === "profile_not_found") {
        errorMessage = "Perfil não encontrado. Entre em contato com o suporte."
      } else if (errorParam === "confirmation_failed") {
        errorMessage = "Falha na confirmação do email. Tente novamente."
      } else if (errorParam === "callback_error") {
        errorMessage = "Erro no processo de confirmação. Tente fazer login novamente."
      } else if (errorParam === "no_code") {
        errorMessage = "Link de confirmação inválido."
      } else if (errorDescription) {
        errorMessage = decodeURIComponent(errorDescription)
      }

      setError(errorMessage)
    } else if (message) {
      setSuccessMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setErrorDetails(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await loginUserAction(formData)

      if (!result.success) {
        setError(result.error || "Erro ao fazer login")
        if ("details" in result && result.details) {
          setErrorDetails(result.details as string)
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Erro ao fazer login. Tente novamente.")
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
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">
                      Senha
                    </Label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-12 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {successMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                    {errorDetails && (
                      <p className="text-xs text-red-500 font-mono bg-red-100 p-2 rounded">
                        Detalhes técnicos: {errorDetails}
                      </p>
                    )}
                    {error.includes("Sistema não configurado") && (
                      <p className="text-xs text-red-500 mt-2">
                        💡 Execute o script SQL 'setup-complete-auth.sql' para configurar o banco de dados.
                      </p>
                    )}
                    {error.includes("Email ou senha incorretos") && !errorDetails && (
                      <p className="text-xs text-red-500 mt-2">
                        💡 Dica: Verifique se você já criou uma conta ou se o banco de dados foi configurado.
                      </p>
                    )}
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
