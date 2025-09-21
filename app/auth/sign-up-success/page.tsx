"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpSuccessPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setEmail(urlParams.get("email"))
  }, [])

  const handleResendConfirmation = async () => {
    if (!email) {
      setResendMessage("Email não encontrado. Tente se cadastrar novamente.")
      return
    }

    setIsResending(true)
    setResendMessage("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/login`,
        },
      })

      if (error) {
        throw error
      }

      setResendMessage("Email de confirmação reenviado com sucesso! Verifique sua caixa de entrada.")
    } catch (error) {
      console.error("Erro ao reenviar email:", error)
      setResendMessage("Erro ao reenviar email. Tente novamente em alguns minutos.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Conta Criada com Sucesso!</CardTitle>
            <CardDescription className="text-base">
              Agora você precisa confirmar seu email para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Verifique seu email</h3>
                  <p className="text-sm text-blue-700">
                    Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta.
                  </p>
                  {email && <p className="text-xs text-blue-600 mt-1 font-mono">{email}</p>}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Importante</h3>
                  <p className="text-sm text-amber-700">
                    Você só conseguirá fazer login após confirmar seu email. Verifique também sua caixa de spam.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900">Não recebeu o email?</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendConfirmation}
                  disabled={isResending || !email}
                  className="text-xs bg-transparent"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3 h-3 mr-1" />
                      Reenviar
                    </>
                  )}
                </Button>
              </div>

              {resendMessage && (
                <div
                  className={`text-sm p-3 rounded-lg ${
                    resendMessage.includes("sucesso")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {resendMessage}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Próximos passos:</h4>
              <ol className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                    1
                  </span>
                  Abra seu email e procure por uma mensagem do InvoiceFlow
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                    2
                  </span>
                  Clique no link "Confirmar Email" na mensagem
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold mt-0.5">
                    3
                  </span>
                  Retorne aqui e faça login com suas credenciais
                </li>
              </ol>
            </div>

            <Button asChild className="w-full">
              <Link href="/auth/login">Ir para Login</Link>
            </Button>

            <p className="text-xs text-slate-500 text-center">Problemas com o email? Entre em contato com o suporte.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
