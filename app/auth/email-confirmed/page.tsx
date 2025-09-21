import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function EmailConfirmedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">Email Confirmado!</CardTitle>
            <CardDescription className="text-base">Sua conta foi ativada com sucesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <h3 className="font-semibold text-green-900 mb-2">Parabéns!</h3>
                <p className="text-sm text-green-700">
                  Seu email foi confirmado e sua conta está ativa. Agora você pode acessar todas as funcionalidades do
                  sistema.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">O que você pode fazer agora:</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Gerenciar suas notas fiscais
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Cadastrar clientes e empresas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Gerar relatórios financeiros
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Controlar pagamentos
                </li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
