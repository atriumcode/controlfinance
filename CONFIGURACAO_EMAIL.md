# Configuração de Envio de Email para Certidões

O sistema está preparado para enviar certidões por email, mas você precisa configurar um serviço de email.

## Opções de Serviços de Email

### 1. Resend (Recomendado) ⭐

**Vantagens:**
- Fácil de configurar
- API moderna e simples
- Plano gratuito generoso (100 emails/dia)
- Excelente para Next.js

**Configuração:**

1. Crie uma conta em [resend.com](https://resend.com)
2. Obtenha sua API Key
3. Adicione ao `.env.local`:
   \`\`\`env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   \`\`\`
4. Instale o pacote:
   \`\`\`bash
   npm install resend
   \`\`\`
5. Descomente o código Resend em `app/api/certificates/send-email/route.ts`

### 2. SendGrid

**Configuração:**

1. Crie uma conta em [sendgrid.com](https://sendgrid.com)
2. Obtenha sua API Key
3. Adicione ao `.env.local`:
   \`\`\`env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   \`\`\`
4. Instale o pacote:
   \`\`\`bash
   npm install @sendgrid/mail
   \`\`\`

### 3. Nodemailer (SMTP)

**Configuração:**

1. Configure suas credenciais SMTP no `.env.local`:
   \`\`\`env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-de-app
   SMTP_FROM=Sistema <noreply@seudominio.com>
   \`\`\`
2. Instale o pacote:
   \`\`\`bash
   npm install nodemailer
   \`\`\`
3. Descomente o código Nodemailer em `app/api/certificates/send-email/route.ts`

## Exemplo Completo com Resend

\`\`\`typescript
// app/api/certificates/send-email/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)


await resend.emails.send({
  from: 'Sistema <noreply@seudominio.com>',
  to: [to],
  subject: subject,
  text: emailBody,
  attachments: validAttachments.map(att => ({
    filename: att.filename,
    content: att.content,
  })),
})
\`\`\`

## Testando

Após configurar, teste enviando uma certidão:

1. Acesse o módulo de Certidões
2. Selecione uma ou mais certidões
3. Clique em "Enviar por Email"
4. Preencha o email do destinatário
5. Clique em "Enviar Email"

Os logs no console mostrarão o progresso do envio.
