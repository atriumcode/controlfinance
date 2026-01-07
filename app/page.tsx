import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BarChart3, FileText, Users, CreditCard, TrendingUp, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">InvoiceFlow</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </Link>
              <Link href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
                Benefícios
              </Link>
              <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Começar Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">
                  Gestão Financeira
                  <span className="text-accent block">Inteligente</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                  Transforme sua gestão de notas fiscais com nossa plataforma moderna. Automatize processos, controle
                  pagamentos e tome decisões baseadas em dados.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/auth/register">
                    Começar Gratuitamente
                    <TrendingUp className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                  <Link href="/auth/login">Fazer Login</Link>
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground pt-8">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Conformidade Fiscal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Relatórios Avançados</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-balance">
                  Controle completo sobre suas notas fiscais, pagamentos e relatórios financeiros em uma plataforma
                  moderna e segura
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Visualize o crescimento do seu negócio com dashboards intuitivos e relatórios em tempo real
                </p>
              </div>

              {/* Modern Financial Chart */}
              <div className="relative max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-background to-muted/50 rounded-2xl border shadow-2xl p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-accent" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Dashboard Financeiro</h3>
                          <p className="text-muted-foreground">Métricas em tempo real</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Receita Mensal</span>
                          <span className="text-lg font-bold text-green-600">R$ 45.280</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Notas Processadas</span>
                          <span className="text-lg font-bold text-blue-600">1.247</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Taxa de Crescimento</span>
                          <span className="text-lg font-bold text-accent">+23.5%</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Crescimento Anual</h4>
                            <span className="text-sm text-muted-foreground">2024</span>
                          </div>

                          {/* Chart Bars */}
                          <div className="flex items-end justify-between h-32 space-x-2">
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "60%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Jan</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "75%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Fev</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "85%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Mar</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "70%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Abr</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "90%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Mai</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                              <div
                                className="w-8 bg-gradient-to-t from-accent to-accent/60 rounded-t"
                                style={{ height: "100%" }}
                              ></div>
                              <span className="text-xs text-muted-foreground">Jun</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-center space-x-4 pt-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-accent"></div>
                              <span className="text-xs text-muted-foreground">Faturamento</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Gestão de Notas Fiscais</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Tudo que você precisa para gerenciar suas finanças de forma eficiente
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Importação Automática</CardTitle>
                  <CardDescription className="text-base">
                    Importe arquivos XML de notas fiscais com validação automática
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Processe centenas de notas fiscais em segundos com nossa tecnologia avançada de OCR e validação.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Gestão de Clientes</CardTitle>
                  <CardDescription className="text-base">
                    Cadastro completo com validação de CPF/CNPJ em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Mantenha um banco de dados atualizado de clientes com histórico completo de transações.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <CreditCard className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Controle de Pagamentos</CardTitle>
                  <CardDescription className="text-base">
                    Acompanhe status de pagamentos e vencimentos automaticamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receba notificações de vencimentos e mantenha seu fluxo de caixa sempre organizado.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Dashboard Inteligente</CardTitle>
                  <CardDescription className="text-base">Visualize métricas e KPIs em tempo real</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gráficos interativos e relatórios personalizáveis para análises estratégicas.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Segurança Avançada</CardTitle>
                  <CardDescription className="text-base">Criptografia de ponta e backup automático</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Seus dados protegidos com os mais altos padrões de segurança da indústria.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Relatórios Avançados</CardTitle>
                  <CardDescription className="text-base">
                    Exportação em múltiplos formatos com filtros personalizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gere relatórios detalhados para contabilidade e tomada de decisões estratégicas.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">
                Pronto para Transformar sua Gestão Financeira?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Junte-se a milhares de empresas que já otimizaram seus processos financeiros
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/auth/register">Começar Agora - É Grátis</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent" asChild>
                  <Link href="/auth/login">Já tenho uma conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-accent flex items-center justify-center">
                <FileText className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-semibold">Copycenter Ltda</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacidade
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Termos
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Suporte
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 - 2026 Copycenter Ltda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
