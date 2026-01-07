"use client"

import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useState } from "react"

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function LogoutButton({ variant = "ghost", size = "default", className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await logoutUser()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleLogout} disabled={isLoading} className={className}>
      <LogOut className="w-4 h-4 mr-2" />
      {isLoading ? "Saindo..." : "Sair"}
    </Button>
  )
}
