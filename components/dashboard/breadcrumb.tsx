"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function DashboardBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .slice(1) // remove "dashboard"

  let currentPath = "/dashboard"

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>

      {segments.map((segment, index) => {
        currentPath += `/${segment}`

        const isLast = index === segments.length - 1
        const label = segment
          .replace("-", " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())

        return (
          <span key={currentPath} className="flex items-center gap-1">
            <span className="opacity-50">/</span>

            {isLast ? (
              <span className="text-foreground font-medium">
                {label}
              </span>
            ) : (
              <Link
                href={currentPath}
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
