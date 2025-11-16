import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ReactNode } from "react"

interface SectionCardProps {
  title: string
  description?: string
  children: ReactNode
  headerStyle?: "default" | "gray"
}

export function SectionCard({ title, description, children, headerStyle = "default" }: SectionCardProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className={headerStyle === "gray" ? "bg-gray-50 border-b border-gray-200" : ""}>
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {description && <CardDescription className="text-gray-600">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
