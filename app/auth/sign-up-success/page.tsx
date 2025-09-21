import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"

export default function SignUpSuccessPage() {
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

            <p className="text-xs text-slate-500 text-center">
              Não recebeu o email? Verifique sua caixa de spam ou entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
