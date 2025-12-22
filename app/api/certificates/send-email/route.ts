export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, subject, message, certificates } = body

    if (!to || !certificates || certificates.length === 0) {
      return NextResponse.json({ error: "Email e certidões são obrigatórios" }, { status: 400 })
    }

    // Baixar os arquivos PDF do Blob Storage
    const attachments = await Promise.all(
      certificates.map(async (cert: { name: string; url: string }) => {
        try {
          const response = await fetch(cert.url)
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString("base64")

          return {
            filename: cert.name,
            content: base64,
            contentType: "application/pdf",
          }
        } catch (error) {
          console.error(`[v0] Erro ao baixar arquivo ${cert.name}:`, error)
          return null
        }
      }),
    )

    // Filtrar anexos que falharam
    const validAttachments = attachments.filter((att) => att !== null)

    if (validAttachments.length === 0) {
      return NextResponse.json({ error: "Erro ao processar os arquivos" }, { status: 500 })
    }

    // Preparar o corpo do email
    const emailBody = `
      ${message ? `${message}\n\n` : ""}
      ---
      
      Este email contém ${validAttachments.length} certidão${validAttachments.length !== 1 ? "ões" : ""} em anexo:
      
      ${validAttachments.map((att, i) => `${i + 1}. ${att?.filename}`).join("\n")}
      
      ---
      Enviado automaticamente pelo Sistema de Gestão
    `

    // Aqui você pode integrar com serviços de email:
    // Opção 1: Resend (recomendado) - https://resend.com
    // Opção 2: SendGrid - https://sendgrid.com
    // Opção 3: Nodemailer com SMTP
    // Opção 4: AWS SES

    // Exemplo com Resend (descomente e configure RESEND_API_KEY):
    /*
    const { Resend } = require('resend')
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
    */

    // Exemplo com Nodemailer (descomente e configure SMTP):
    /*
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to,
      subject: subject,
      text: emailBody,
      attachments: validAttachments.map(att => ({
        filename: att.filename,
        content: Buffer.from(att.content, 'base64'),
        contentType: att.contentType,
      })),
    })
    */

    console.log("[v0] Email preparado para envio:", {
      to,
      subject,
      attachments: validAttachments.length,
    })

    // Por enquanto, simula o envio (remova isso quando configurar um serviço real)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      message: `Email preparado com ${validAttachments.length} anexo(s)`,
    })
  } catch (error) {
    console.error("[v0] Erro ao enviar email:", error)
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 })
  }
}
