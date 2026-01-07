"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  console.error(error)

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold">
          Ocorreu um erro ao carregar o dashboard
        </h2>

        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>

        <button
          onClick={reset}
          className="underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
