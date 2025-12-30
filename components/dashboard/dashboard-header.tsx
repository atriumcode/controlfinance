"use client"

import { logout } from "@/app/actions/logout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

interface DashboardHeaderProps {
  userName: string
  companyName: string
}

export function DashboardHeader({
  userName,
  companyName,
}: DashboardHeaderProps) {
  const initials =
    userName
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U"

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Empresa */}
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">
          {companyName}
        </span>
        <span className="text-xs text-muted-foreground">
          Painel Administrativo
        </span>
      </div>

      {/* Avatar + Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-9 w-9 rounded-full p-0"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56"
        >
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-sm font-medium">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground">
              {companyName}
            </span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <form action={logout}>
            <DropdownMenuItem asChild>
              <button
                type="submit"
                className="flex w-full items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
