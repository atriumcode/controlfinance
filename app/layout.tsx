import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "./providers"

/**
 * Fonte local (Inter)
 * Evita problemas de build com fonts.gstatic.com
 */
const inter = localFont({
  src: [
    {
      path: "../public/fonts/inter/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/inter/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "ControlFinance",
    template: "%s | ControlFinance",
  },
  description: "Sistema de gestão financeira e notas fiscais",
  applicationName: "ControlFinance",
  lang: "pt-BR",
}

/**
 * RootLayout GLOBAL
 * - NÃO usar requireAuth
 * - NÃO usar requireCompany
 * - NÃO fazer redirects
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
