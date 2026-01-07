"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function CreateInvoiceButton() {
  const router = useRouter()

  return (
    <Button
      className="w-full"
      onClick={() => router.push("/dashboard/invoices/new")}
    >
      Criar Nova Nota Fiscal
    </Button>
  )
}
