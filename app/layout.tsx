import { ReactNode } from "react"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* SIDEBAR (mantém a sua atual) */}
      <aside className="w-64 border-r bg-background hidden md:block" />

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <Breadcrumb />
          <ThemeSwitcher />
        </header>

        <section className="flex-1 p-4 md:p-8">
          {children}
        </section>
      </main>
    </div>
  )
}
