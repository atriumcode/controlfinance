import { PageHeader } from "@/components/layout/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Clientes"
        description="Carregando clientes..."
      />

      {/* Tabela skeleton */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-5 gap-4 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>

        <div className="divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 p-4"
            >
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-8 w-8 justify-self-end rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
