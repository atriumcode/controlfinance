# Invoice System - Design System

## Overview
Este documento define o design system padronizado para todo o sistema de invoice. O padrão de referência é a página de **Pagamentos** (`app/dashboard/payments/page.tsx`).

## Core Principles
1. **Consistência Visual**: Todos os componentes seguem o mesmo padrão visual
2. **Hierarquia Clara**: Uso consistente de tipografia e espaçamento
3. **Cor Primária Única**: Purple-600 (#9333EA) para ações e destaques
4. **Estados Visuais**: Hover, focus e active states consistentes

---

## Colors

### Primary Color
- **Purple-600**: `#9333EA` - Botões primários, ícones de destaque, links importantes
- **Purple-700**: `#7E22CE` - Hover state para botões primários

### Neutral Colors
- **Gray-50**: `#F9FAFB` - Card headers, backgrounds sutis
- **Gray-200**: `#E5E7EB` - Bordas, separadores
- **Gray-600**: `#4B5563` - Texto secundário, labels
- **Gray-900**: `#111827` - Texto primário, títulos

### Status Colors
- **Green-600**: `#16A34A` - Sucesso, valores positivos, status "pago"
- **Red-600**: `#DC2626` - Erro, valores negativos, status "vencido"
- **Orange-600**: `#EA580C` - Aviso, status "pendente"
- **Blue-600**: `#2563EB` - Informação, status "processando"

---

## Typography

### Font Family
- **Sans-serif**: Sistema padrão do Next.js (Geist Sans)

### Text Styles

#### Page Title (H1)
\`\`\`tsx
className="text-3xl font-bold tracking-tight text-gray-900"
\`\`\`

#### Page Description
\`\`\`tsx
className="text-gray-600 mt-1"
\`\`\`

#### Section Title (Card Title)
\`\`\`tsx
className="text-lg font-semibold text-gray-900"
\`\`\`

#### Stat Card Title
\`\`\`tsx
className="text-sm font-medium text-gray-600"
\`\`\`

#### Stat Card Value
\`\`\`tsx
className="text-2xl font-bold"
\`\`\`

#### Body Text
\`\`\`tsx
className="text-sm text-gray-600"
\`\`\`

---

## Spacing Scale

Use Tailwind's spacing scale consistently:
- **Gap between sections**: `space-y-6`
- **Container padding**: `p-6 md:p-8`
- **Card padding**: `p-6`
- **Element margins**: `mt-1`, `mt-2`, `mt-4`
- **Grid gaps**: `gap-4`

---

## Components

### 1. Page Header
**Localização**: `components/shared/page-header.tsx`

**Uso**:
\`\`\`tsx
<PageHeader 
  title="Título da Página"
  description="Descrição opcional"
  action={{
    label: "Nova Ação",
    href: "/caminho",
    icon: PlusIcon
  }}
/>
\`\`\`

### 2. Stat Card
**Localização**: `components/shared/stat-card.tsx`

**Uso**:
\`\`\`tsx
<StatCard
  title="Total Recebido"
  value="R$ 10.000,00"
  icon={DollarSign}
  description="Este mês"
  valueColor="text-green-600"
/>
\`\`\`

### 3. Status Badge
**Localização**: `components/shared/status-badge.tsx`

**Uso**:
\`\`\`tsx
<StatusBadge status="paid" />
<StatusBadge status="pending" />
<StatusBadge status="partial" />
<StatusBadge status="overdue" />
\`\`\`

### 4. Section Card
**Localização**: `components/shared/section-card.tsx`

**Uso**:
\`\`\`tsx
<SectionCard 
  title="Título da Seção"
  description="Descrição opcional"
  headerStyle="gray"
>
  {/* Conteúdo */}
</SectionCard>
\`\`\`

### 5. Breadcrumb
**Localização**: `components/shared/breadcrumb.tsx`

**Uso**:
\`\`\`tsx
<Breadcrumb 
  items={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Notas Fiscais", href: "/dashboard/invoices" },
    { label: "Detalhes" }
  ]}
/>
\`\`\`

---

## Card Patterns

### Standard Card
\`\`\`tsx
<Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-gray-600">Label</CardTitle>
    <Icon className="h-4 w-4 text-purple-600" />
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
\`\`\`

### Section Card with Gray Header
\`\`\`tsx
<Card className="border-gray-200 shadow-sm">
  <CardHeader className="bg-gray-50 border-b border-gray-200">
    <CardTitle className="text-lg font-semibold text-gray-900">Título</CardTitle>
    <CardDescription className="text-gray-600">Descrição</CardDescription>
  </CardHeader>
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
\`\`\`

---

## Button Patterns

### Primary Button
\`\`\`tsx
<Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
  Ação Principal
</Button>
\`\`\`

### Outline Button
\`\`\`tsx
<Button variant="outline" className="border-gray-300 bg-transparent">
  Ação Secundária
</Button>
\`\`\`

### Destructive Button
\`\`\`tsx
<Button variant="destructive">
  Excluir
</Button>
\`\`\`

---

## Layout Structure

### Page Container
\`\`\`tsx
<div className="flex-1 space-y-6 p-6 md:p-8">
  {/* Page content */}
</div>
\`\`\`

### Grid Layouts
\`\`\`tsx
{/* 2 columns on medium, 4 on large */}
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Cards */}
</div>
\`\`\`

---

## Responsive Patterns

### Mobile-First Approach
\`\`\`tsx
{/* Mobile: column, Desktop: row */}
<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
  {/* Content */}
</div>
\`\`\`

### Responsive Padding
\`\`\`tsx
className="p-6 md:p-8"
\`\`\`

### Responsive Grid
\`\`\`tsx
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
\`\`\`

---

## Icon Usage

### Icon Size
- **Small**: `h-4 w-4` (16px) - Inline icons, buttons
- **Medium**: `h-5 w-5` (20px) - Card headers
- **Large**: `h-6 w-6` (24px) - Page headers, empty states

### Icon Color
- **Primary**: `text-purple-600` - Actions, highlights
- **Muted**: `text-gray-400` - Secondary icons
- **Status**: Use status colors (green, red, orange)

---

## Migration Checklist

Para migrar uma página existente para o design system:

1. [ ] Substituir header manual por `<PageHeader />`
2. [ ] Usar `<StatCard />` para cards de estatísticas
3. [ ] Usar `<StatusBadge />` para status de invoices
4. [ ] Usar `<SectionCard />` para seções com conteúdo
5. [ ] Adicionar `<Breadcrumb />` em páginas de detalhes
6. [ ] Verificar cores: Purple-600 para primária, Gray para neutros
7. [ ] Verificar cards: `border-gray-200 shadow-sm hover:shadow-md`
8. [ ] Verificar tipografia: `text-3xl font-bold` para títulos
9. [ ] Verificar espaçamentos: `space-y-6` entre seções
10. [ ] Testar responsividade: Mobile e Desktop

---

## Examples

Páginas já padronizadas:
- ✅ `/dashboard/payments` - Referência principal
- ✅ `/dashboard/admin` - Cards padronizados
- ✅ `/dashboard/certificates` - Status badges

Páginas a migrar:
- ⏳ `/dashboard` - Precisa usar PageHeader e StatCards consistentes
- ⏳ `/dashboard/invoices` - Precisa padronizar cards
- ⏳ `/dashboard/reports` - Precisa padronizar layout
- ⏳ `/dashboard/settings` - Precisa usar SectionCard

---

## Development Guidelines

1. **Sempre use componentes compartilhados**: Não duplique código
2. **Mantenha consistência**: Siga os padrões exatamente
3. **Teste responsividade**: Mobile e desktop obrigatório
4. **Documente mudanças**: Atualize este arquivo
5. **Code review**: Verifique se segue o design system
