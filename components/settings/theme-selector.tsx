"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Monitor, Moon, Sun } from "lucide-react"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="space-y-2">
      <Label htmlFor="theme">Tema da Interface</Label>
      <Select value={theme} onValueChange={setTheme}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione um tema" />
        </SelectTrigger>
        <SelectContent>
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            return (
              <SelectItem key={themeOption.value} value={themeOption.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {themeOption.label}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">
        Escolha entre tema claro, escuro ou seguir as configurações do sistema
      </p>
    </div>
  )
}
