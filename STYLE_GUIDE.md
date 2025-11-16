# Guia de Estilos - Sistema de Notas Fiscais

## 🎨 Sistema de Cores

### Cor Primária
\`\`\`css
--primary: 239 84% 67% /* Purple #6366F1 - Indigo moderno */
\`\`\`

**Uso:** Botões principais, ícones de destaque, elementos interativos

**Classes Tailwind:**
- `bg-purple-600` - Background de botões primários
- `hover:bg-purple-700` - Hover de botões
- `text-purple-600` - Ícones e textos de destaque

---

### Cores Neutras

\`\`\`css
--foreground: 222.2 84% 4.9%  /* Gray 900 - Quase preto */
--muted: 210 40% 96.1%         /* Gray 50 - Cinza muito claro */
--border: 214.3 31.8% 91.4%    /* Gray 200 - Bordas */
\`\`\`

**Hierarquia de Cinzas:**
- `text-gray-900` - Títulos principais (h1, h2)
- `text-gray-600` - Descrições, textos secundários
- `text-gray-500` - Labels, metadados
- `bg-gray-50` - Background de headers de cards
- `border-gray-200` - Bordas de cards e inputs

---

### Cores de Status

**Sucesso / Positivo:**
- `text-green-600` - R$ 10.000,00 (valores recebidos)
- `bg-green-100 text-green-800` - Badge "Paga"

**Aviso / Pendente:**
- `text-orange-600` ou `text-yellow-600` - Valores pendentes
- `bg-yellow-100 text-yellow-800` - Badge "Parcial"

**Erro / Negativo:**
- `text-red-600` - Valores vencidos, pendentes
- `bg-red-100 text-red-800` - Badge "Vencida"

**Informação / Neutro:**
- `text-blue-600` - Links, informações
- `bg-blue-100 text-blue-800` - Badge "Pendente"

**Roxo / Purple:**
- `text-purple-600` - Ícones e destaques
- `bg-purple-600` - Botões primários

---

## 📝 Tipografia

### Fontes
O sistema usa as fontes padrão do Tailwind:
- **Sans**: System fonts (Inter, SF Pro, etc.)
- **Mono**: Monospace para códigos

### Hierarquia

**Título de Página (H1):**
\`\`\`tsx
<h1 className="text-3xl font-bold tracking-tight text-gray-900">
  Dashboard
</h1>
\`\`\`

**Descrição de Página:**
\`\`\`tsx
<p className="text-gray-600 mt-1">
  Acompanhe o desempenho do seu negócio
</p>
\`\`\`

**Título de Card (H2):**
\`\`\`tsx
<CardTitle className="text-lg font-semibold text-gray-900">
  Histórico de Pagamentos
</CardTitle>
\`\`\`

**Descrição de Card:**
\`\`\`tsx
<CardDescription className="text-gray-600">
  Últimos pagamentos registrados no sistema
</CardDescription>
\`\`\`

**Label / Subtítulo:**
\`\`\`tsx
<CardTitle className="text-sm font-medium text-gray-600">
  Total Recebido
</CardTitle>
\`\`\`

**Valores / Métricas:**
\`\`\`tsx
<div className="text-2xl font-bold text-gray-900">
  R$ 10.000,00
</div>
\`\`\`

**Metadados / Info Secundária:**
\`\`\`tsx
<p className="text-xs text-gray-500 mt-1">
  Este mês
</p>
\`\`\`

---

## 📐 Espaçamento

### Grid e Layout

**Container Principal:**
\`\`\`tsx
<div className="flex-1 space-y-6 p-6 md:p-8">
  {/* Conteúdo */}
</div>
\`\`\`

**Grid de Stats (4 colunas em desktop):**
\`\`\`tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* StatCards */}
</div>
\`\`\`

**Grid de 2 colunas:**
\`\`\`tsx
<div className="grid gap-6 lg:grid-cols-2">
  {/* Charts ou Cards */}
</div>
\`\`\`

### Cards

**Card Padrão:**
\`\`\`tsx
<Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="bg-gray-50 border-b border-gray-200">
    {/* Padding padrão do CardHeader */}
  </CardHeader>
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
\`\`\`

**Espaçamento entre elementos dentro do card:**
\`\`\`tsx
<CardContent className="space-y-3 p-6">
  {/* Elementos com espaçamento de 12px entre eles */}
</CardContent>
\`\`\`

---

## 🔘 Botões

### Botão Primário
\`\`\`tsx
<Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
  Nova Nota Fiscal
</Button>
\`\`\`

### Botão Secundário / Outline
\`\`\`tsx
<Button variant="outline" className="border-gray-300 bg-transparent">
  Importar XML
</Button>
\`\`\`

### Botão Destrutivo
\`\`\`tsx
<Button variant="destructive" className="gap-2">
  <Trash2 className="h-4 w-4" />
  Excluir
</Button>
\`\`\`

### Botões com Ícones
\`\`\`tsx
<Button className="gap-2">
  <CreditCard className="h-4 w-4" />
  Registrar Pagamento
</Button>
\`\`\`

**Tamanhos de ícones:**
- `h-4 w-4` - Dentro de botões
- `h-5 w-5` - Dentro de headers
- `h-12 w-12` - Estados vazios, ilustrações

---

## 🎴 Cards e Containers

### Card com Header
\`\`\`tsx
<Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="bg-gray-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900">
      Título do Card
    </CardTitle>
    <CardDescription className="text-gray-600">
      Descrição do conteúdo
    </CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
\`\`\`

### Stat Card (Card de Métricas)
\`\`\`tsx
<Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">
      Total Recebido
    </CardTitle>
    <DollarSign className="h-4 w-4 text-purple-600" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold text-green-600">
      R$ 10.000,00
    </div>
    <p className="text-xs text-gray-500 mt-1">Este mês</p>
  </CardContent>
</Card>
\`\`\`

---

## 🏷️ Badges e Status

### Status Badge
\`\`\`tsx
import { StatusBadge } from "@/components/shared/status-badge"

<StatusBadge status="paid" />     // Verde
<StatusBadge status="pending" />  // Azul
<StatusBadge status="partial" />  // Amarelo
<StatusBadge status="overdue" />  // Vermelho
\`\`\`

### Badge Customizado
\`\`\`tsx
<Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
  Ativo
</Badge>
\`\`\`

---

## 📱 Responsividade

### Breakpoints Tailwind
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Padrões Responsivos

**Grid de 4 colunas:**
\`\`\`tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile, 2 tablet, 4 desktop */}
</div>
\`\`\`

**Flex com Stack em Mobile:**
\`\`\`tsx
<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
  {/* Stack vertical em mobile, horizontal em desktop */}
</div>
\`\`\`

**Padding Responsivo:**
\`\`\`tsx
<div className="p-6 md:p-8">
  {/* 24px mobile, 32px desktop */}
</div>
\`\`\`

---

## ⚡ Transições e Animações

### Hover em Cards
\`\`\`tsx
className="hover:shadow-md transition-shadow"
\`\`\`

### Hover em Botões
\`\`\`tsx
className="hover:bg-purple-700 transition-colors"
\`\`\`

### Transições Suaves
\`\`\`tsx
className="transition-all duration-200"
\`\`\`

---

## 🎯 Padrões de Uso

### Page Header
\`\`\`tsx
import { PageHeader } from "@/components/shared/page-header"

<PageHeader 
  title="Dashboard"
  description="Acompanhe o desempenho do seu negócio"
  action={
    <Button className="bg-purple-600 hover:bg-purple-700">
      Ver Relatórios
    </Button>
  }
/>
\`\`\`

### Stats Grid
\`\`\`tsx
import { StatCard } from "@/components/shared/stat-card"
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatCard
    title="Total Recebido"
    value="R$ 10.000,00"
    icon={DollarSign}
    description="Este mês"
    valueColor="text-green-600"
  />
  <StatCard
    title="A Receber"
    value="R$ 5.000,00"
    icon={TrendingUp}
    description="Pendente"
    valueColor="text-orange-600"
  />
</div>
\`\`\`

---

## 🚫 O Que Evitar

❌ **NÃO use background cinza no container principal:**
\`\`\`tsx
// ERRADO
<div className="flex min-h-screen w-full flex-col bg-gray-50">

// CORRETO
<div className="flex-1 space-y-6 p-6 md:p-8">
\`\`\`

❌ **NÃO use cores hard-coded para status:**
\`\`\`tsx
// ERRADO
const getStatusColor = (status) => {
  if (status === 'paid') return 'bg-green-100'
}

// CORRETO
import { StatusBadge } from "@/components/shared/status-badge"
<StatusBadge status="paid" />
\`\`\`

❌ **NÃO replique o mesmo header em todas as páginas:**
\`\`\`tsx
// ERRADO
<div className="flex justify-between">
  <div><h1>...</h1><p>...</p></div>
  <Button>...</Button>
</div>

// CORRETO
<PageHeader title="..." description="..." action={<Button>...</Button>} />
\`\`\`

---

**Versão:** 1.0
**Última atualização:** $(date)
