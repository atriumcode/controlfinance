export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6">
        {children}
      </div>
    </div>
  )
}
