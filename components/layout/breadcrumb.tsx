"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <nav className="text-sm text-muted-foreground flex items-center gap-1">
      <Link href="/dashboard" className="hover:text-foreground">
        Dashboard
      </Link>

      {segments.slice(1).map((segment, index) => {
        const href = "/" + segments.slice(0, index + 2).join("/")

        return (
          <span key={href} className="flex items-center gap-1">
            <span>/</span>
            <Link href={href} className="hover:text-foreground capitalize">
              {segment.replace("-", " ")}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
