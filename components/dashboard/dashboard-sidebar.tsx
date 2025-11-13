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
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center border-b border-slate-200 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold group">
          <FileText className="h-6 w-6 text-white" />
          <span className="text-xl text-white font-bold tracking-tight">NF-e System</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.name)
              return (
                <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleItem(item.name)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-3 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-11 pt-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          "w-full justify-start gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors",
                          pathname === child.href && "bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100",
                        )}
                      >
                        <Link href={child.href}>
                          <child.icon className="h-4 w-4" />
                          <span className="text-sm">{child.name}</span>
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
                  "w-full justify-start gap-3 px-3 py-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors",
                  pathname === item.href && "bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
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
      <div className={cn("hidden border-r border-slate-200 md:block w-64 fixed h-full bg-white z-30", className)}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden fixed top-4 left-4 z-40 bg-indigo-600 text-white hover:bg-indigo-700 border-0 shadow-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64 border-slate-200">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
