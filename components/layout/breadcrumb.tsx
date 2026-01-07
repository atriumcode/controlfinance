"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <nav className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap gap-1">
        <li>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          const href = "/" + segments.slice(0, index + 2).join("/")
          const isLast = index === segments.length - 2

          return (
            <li key={href} className="flex gap-1">
              <span>/</span>
              {isLast ? (
                <span className="text-foreground capitalize">
                  {segment.replace("-", " ")}
                </span>
              ) : (
                <Link href={href} className="hover:text-foreground capitalize">
                  {segment.replace("-", " ")}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
