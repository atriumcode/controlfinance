import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { ThemeProvider } from "@/components/theme/theme-provider"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <Breadcrumb />

          <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
