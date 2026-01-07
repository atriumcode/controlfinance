import { ThemeToggle } from "@/components/theme/theme-toggle"

export function Header() {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-6">
      <div className="text-sm text-muted-foreground">
        ControlFinance
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  )
}
