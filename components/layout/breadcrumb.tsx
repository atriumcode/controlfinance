"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumb() {
  const pathname = usePathname()

  // 🔒 Blindagem CRÍTICA contra hidratação
  if (!pathname) return null

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1) // remove "dashboard"

  if (segments.length === 0) {
    return (
      <nav className="text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
      </nav>
    )
  }

  return (
    <nav className="text-sm text-muted-foreground flex items-center gap-1">
      <Link href="/dashboard" className="hover:text-foreground">
        Dashboard
      </Link>

      {segments.map((segment, index) => {
        const href = "/dashboard/" + segments.slice(0, index + 1).join("/")

        return (
          <span key={href} className="flex items-center gap-1">
            <span>/</span>
            <Link
              href={href}
              className="hover:text-foreground capitalize"
            >
              {segment.replace(/-/g, " ")}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
