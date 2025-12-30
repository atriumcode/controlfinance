"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  BarChart3,
  FileText,
  DollarSign,
  FileBarChart,
  FolderOpen,
  Settings,
  Users,
  CreditCard,
  Building2,
  Menu,
  ChevronDown,
  ChevronRight,
  Landmark,
  FileCheck,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Notas Fiscais",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    name: "Pagamentos",
    href: "/dashboard/payments",
    icon: DollarSign,
  },
  {
    name: "Extratos Bancários",
    href: "/dashboard/bank-statements",
    icon: Landmark,
  },
  {
    name: "Certidões",
    href: "/dashboard/certificates",
    icon: FileCheck,
  },
  {
    name: "Relatórios",
    href: "/dashboard/reports",
    icon: FileBarChart,
  },
  {
    name: "Cadastros",
    icon: FolderOpen,
    children: [
      {
        name: "Clientes",
        href: "/dashboard/clients",
        icon: Users,
      },
      {
        name: "Usuários",
        href: "/dashboard/users",
        icon: Users,
      },
      {
        name: "Métodos de Pagamento",
        href: "/dashboard/payment-methods",
        icon: CreditCard,
      },
      {
        name: "Configurações",
        href: "/dashboard/settings",
        icon: Building2,
      },
    ],
  },
  {
    name: "Admin",
    href: "/dashboard/admin",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function DashboardSidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (name: string) => {
    setOpenItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 lg:h-[60px] items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6" />
          <span className="text-lg">NF-e System</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-4">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.name)
              return (
                <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleItem(item.name)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 px-3">
                      <item.icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-6">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          "w-full justify-start gap-2",
                          pathname === child.href && "bg-accent text-accent-foreground",
                        )}
                      >
                        <Link href={child.href}>
                          <child.icon className="h-4 w-4" />
                          {child.name}
                        </Link>
                      </Button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start gap-2",
                  pathname === item.href && "bg-accent text-accent-foreground",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden bg-muted/40 md:block w-64 fixed h-full", className)}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden fixed top-4 left-4 z-40 bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
