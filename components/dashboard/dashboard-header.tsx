import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { redirect } from "next/navigation"
import { deleteSession } from "@/lib/auth/session"

interface DashboardHeaderProps {
  companyName?: string
  userName?: string
}

export function DashboardHeader({ companyName, userName }: DashboardHeaderProps) {
  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-50 flex h-14 items-center gap-4 border-b md:border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:h-[60px] lg:px-6">
      <div className="flex-1">{companyName && <p className="text-sm text-muted-foreground">{companyName}</p>}</div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName || "Usuário"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">Configurações</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form
              action={async () => {
                "use server"
                await deleteSession()
                redirect("/auth/login")
              }}
              className="w-full"
            >
              <button type="submit" className="w-full text-left">
                Sair
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
