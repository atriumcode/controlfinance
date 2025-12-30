"use client"

import { logout } from "@/app/actions/logout"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface DashboardHeaderProps {
  userName: string
  companyName: string
}

export function DashboardHeader({
  userName,
  companyName,
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Identidade */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">
          {companyName}
        </span>
        <span className="text-xs text-muted-foreground">
          {userName}
        </span>
      </div>

      {/* Ações */}
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </form>
    </header>
  )
}
