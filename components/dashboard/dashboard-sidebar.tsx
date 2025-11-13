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
    <div className="flex h-full flex-col bg-gradient-to-b from-[#0F172A] via-[#0F172A] to-[#1E293B]">
      <div className="flex h-16 items-center border-b border-white/10 px-6 bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <Link href="/dashboard" className="flex items-center gap-3 font-semibold group">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-all duration-200">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg text-white font-bold tracking-tight">NF-e System</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 py-6">
          {navigation.map((item) => {
            if (item.children) {
              const isOpen = openItems.includes(item.name)
              return (
                <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleItem(item.name)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-sm rounded-lg transition-all duration-200"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="flex-1 text-left font-medium">{item.name}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-12 pt-2">
                    {item.children.map((child) => (
                      <Button
                        key={child.href}
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          "w-full justify-start gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200",
                          pathname === child.href &&
                            "bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800",
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
                  "w-full justify-start gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 font-medium",
                  pathname === item.href &&
                    "bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-purple-800",
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="text-xs text-slate-400 text-center">
          Powered by <span className="text-purple-400 font-semibold">atendezap</span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className={cn("hidden border-r border-purple-100/20 md:block w-64 fixed h-full shadow-2xl", className)}>
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
            className="shrink-0 md:hidden fixed top-4 left-4 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 border-0 shadow-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64 border-purple-100/20">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
