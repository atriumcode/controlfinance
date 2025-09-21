import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function LoginLoading() {
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
              <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  <div className="h-12 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-16"></div>
                  <div className="h-12 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="h-12 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="text-center">
                <div className="h-4 bg-slate-100 rounded animate-pulse mx-auto w-48"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
