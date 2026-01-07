export const dynamic = "force-dynamic"

import Link from "next/link"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ClientsTable } from "@/components/clients/clients-table"

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes cadastrados"
      >
        <Button asChild>
          <Link href="/dashboard/clients/new">
            Novo Cliente
          </Link>
        </Button>
      </PageHeader>

      <ClientsTable />
    </div>
  )
}
