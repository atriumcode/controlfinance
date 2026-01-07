import { ReactNode } from "react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* SIDEBAR já existente */}
      <aside className="w-64 border-r bg-background hidden md:block" />

      <main className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <Breadcrumbs />
          <ThemeSwitcher />
        </header>

        <section className="p-4 md:p-8">
          {children}
        </section>
      </main>
    </div>
  )
}
