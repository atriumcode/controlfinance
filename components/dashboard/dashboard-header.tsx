"use client"

import { logoutAction } from "@/lib/auth/actions"
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
import { LogOut } from "lucide-react"
import { DashboardBreadcrumb } from "./breadcrumb"


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
    <header className="relative z-30 flex h-14 lg:h-[60px] items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Nome da empresa (alinhado com NF-e System) */}
      <div className="flex flex-col gap-0.5 leading-tight">
        <span className="text-sm font-medium">
          {companyName || "Empresa"}
        </span>

        <DashboardBreadcrumb />
      </div>

      {/* Avatar + Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
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

          <form action={logoutAction}>
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
