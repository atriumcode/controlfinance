import Link from "next/link"
import { LayoutDashboard, FileText, CreditCard, Upload } from "lucide-react"

const menu = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Notas Fiscais", href: "/dashboard/invoices", icon: FileText },
  { label: "Pagamentos", href: "/dashboard/payments", icon: CreditCard },
  { label: "Importar XML", href: "/dashboard/import", icon: Upload },
]

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="h-14 flex items-center px-6 font-bold">
        NF-e System
      </div>

      <nav className="px-2 space-y-1">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
