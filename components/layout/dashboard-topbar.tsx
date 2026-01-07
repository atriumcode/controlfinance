"use client"

import { ThemeToggle } from "@/components/theme-toggle"

interface Props {
  userName?: string | null
}

export function DashboardTopbar({ userName }: Props) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b bg-background flex items-center justify-between px-4 md:px-8">
      <div className="text-sm text-muted-foreground">
        Bem-vindo{userName ? `, ${userName}` : ""}
      </div>

      <ThemeToggle />
    </header>
  )
}
