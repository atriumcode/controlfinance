# Plano de Migração - Design System

## 🎯 Objetivo

Padronizar todas as páginas do dashboard seguindo o design de referência da página de Pagamentos, utilizando componentes compartilhados e design tokens consistentes.

---

## 📋 Checklist de Migração

### Fase 1: Componentes Compartilhados ✅

- [x] Criar `PageHeader` component
- [x] Criar `StatCard` component  
- [x] Criar `StatusBadge` component
- [x] Documentar uso dos componentes

**Tempo estimado:** 30 minutos

---

### Fase 2: Correções de Layout 🔄

#### Dashboard Page
**Arquivo:** `app/dashboard/page.tsx`

**Mudanças:**
1. Remover `bg-gray-50` do container principal
2. Remover tag `<main>` redundante
3. Migrar para `PageHeader` component
4. Padronizar estrutura

**Antes:**
\`\`\`tsx
<div className="flex min-h-screen w-full flex-col bg-gray-50">
  <main className="flex-1 space-y-6 p-6 md:p-8">
    <div className="flex flex-col space-y-4...">
      <div>
        <h1 className="text-3xl...">Dashboard</h1>
        <p className="text-gray-600 mt-1">...</p>
      </div>
      <Button>...</Button>
    </div>
\`\`\`

**Depois:**
\`\`\`tsx
<div className="flex-1 space-y-6 p-6 md:p-8">
  <PageHeader 
    title="Dashboard"
    description="Acompanhe o desempenho do seu negócio"
    action={<Button>...</Button>}
  />
\`\`\`

**Severidade:** MÉDIA
**Tempo estimado:** 15 minutos

---

#### Invoices Page
**Arquivo:** `app/dashboard/invoices/page.tsx`

**Mudanças:**
1. Remover `bg-gray-50` do container
2. Remover tag `<main>` redundante
3. Migrar para `PageHeader` component
4. Substituir `getStatusColor()` por `StatusBadge` component

**Antes:**
\`\`\`tsx
<div className="flex min-h-screen w-full flex-col bg-gray-50">
  <main className="flex-1 space-y-6 p-6 md:p-8">
    ...
    <Badge className={getStatusColor(invoice.status)}>
      {getStatusLabel(invoice.status)}
    </Badge>
\`\`\`

**Depois:**
\`\`\`tsx
<div className="flex-1 space-y-6 p-6 md:p-8">
  <PageHeader 
    title="Notas Fiscais"
    description="..."
    action={...}
  />
  ...
  <StatusBadge status={invoice.status} />
\`\`\`

**Severidade:** MÉDIA
**Tempo estimado:** 20 minutos

---

### Fase 3: Migração para Componentes Compartilhados 🔄

#### Dashboard Stats
**Arquivo:** `app/dashboard/page.tsx`

**Mudanças:**
Migrar componente `DashboardStats` para usar `StatCard`

**Tempo estimado:** 15 minutos

---

#### Invoice Stats  
**Arquivo:** `components/invoices/invoice-stats.tsx`

**Mudanças:**
Usar `StatCard` em vez de replicar HTML

**Tempo estimado:** 10 minutos

---

### Fase 4: Validação e Testes ⏳

- [ ] Testar todas as páginas em desktop (1920x1080)
- [ ] Testar todas as páginas em tablet (768px)
- [ ] Testar todas as páginas em mobile (375px)
- [ ] Verificar acessibilidade (contraste, navegação por teclado)
- [ ] Validar com stakeholders

**Tempo estimado:** 30 minutos

---

## 📊 Progresso

**Total de páginas:** 8
**Páginas migradas:** 0/8
**Componentes criados:** 3/3
**Progresso geral:** 20%

---

## 🎯 Páginas por Prioridade

### Prioridade ALTA
1. ✅ `app/dashboard/payments/page.tsx` - REFERÊNCIA
2. 🔄 `app/dashboard/page.tsx` - Inconsistência de layout
3. 🔄 `app/dashboard/invoices/page.tsx` - Inconsistência de layout

### Prioridade MÉDIA
4. ✅ `app/dashboard/clients/page.tsx` - Já padronizado
5. ✅ `app/dashboard/users/page.tsx` - Já padronizado
6. ✅ `app/dashboard/reports/page.tsx` - Já padronizado

### Prioridade BAIXA
7. ✅ `app/dashboard/bank-statements/page.tsx` - Bem estruturado
8. ✅ `app/dashboard/settings/page.tsx` - Bem estruturado
9. ✅ `app/dashboard/admin/page.tsx` - Bem estruturado

---

## 🚀 Próximos Passos Imediatos

1. Aplicar correções de layout em Dashboard e Invoices
2. Testar responsividade
3. Validar com usuário

**Tempo total estimado:** 1-2 horas

---

**Criado em:** $(date)
**Responsável:** v0 Design System
