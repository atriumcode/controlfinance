import { FileCheck, Download, Calendar, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CertificatesPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certidões</h1>
          <p className="text-gray-600 mt-1">Gerencie certidões fiscais da sua empresa</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Certidão
        </Button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Certidões</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500 mt-1">Todas as certidões cadastradas</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Válidas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-gray-500 mt-1">Certidões vigentes</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vencendo</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-gray-500 mt-1">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-gray-500 mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Lista de Certidões</CardTitle>
              <CardDescription className="text-gray-600">Acompanhe o status das suas certidões fiscais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-gray-200 px-6">
              <TabsList className="bg-transparent h-auto p-0 border-0">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Todas
                </TabsTrigger>
                <TabsTrigger
                  value="valid"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Válidas
                </TabsTrigger>
                <TabsTrigger
                  value="expiring"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Vencendo
                </TabsTrigger>
                <TabsTrigger
                  value="expired"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-4 py-3"
                >
                  Vencidas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-0 m-0">
              <div className="divide-y divide-gray-200">
                {mockCertificates.map((cert) => (
                  <CertificateRow key={cert.id} certificate={cert} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="valid" className="p-0 m-0">
              <div className="divide-y divide-gray-200">
                {mockCertificates
                  .filter((c) => c.status === "valid")
                  .map((cert) => (
                    <CertificateRow key={cert.id} certificate={cert} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="expiring" className="p-0 m-0">
              <div className="divide-y divide-gray-200">
                {mockCertificates
                  .filter((c) => c.status === "expiring")
                  .map((cert) => (
                    <CertificateRow key={cert.id} certificate={cert} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="expired" className="p-0 m-0">
              <div className="divide-y divide-gray-200">
                {mockCertificates
                  .filter((c) => c.status === "expired")
                  .map((cert) => (
                    <CertificateRow key={cert.id} certificate={cert} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function CertificateRow({ certificate }: { certificate: Certificate }) {
  const statusConfig = {
    valid: { color: "bg-green-100 text-green-800 border-green-200", label: "Válida" },
    expiring: { color: "bg-orange-100 text-orange-800 border-orange-200", label: "Vencendo" },
    expired: { color: "bg-red-100 text-red-800 border-red-200", label: "Vencida" },
  }

  const config = statusConfig[certificate.status]

  return (
    <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <FileCheck className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{certificate.name}</h3>
          <div className="flex items-center space-x-3 mt-1">
            <p className="text-xs text-gray-500">{certificate.type}</p>
            <span className="text-gray-300">•</span>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              Válido até: {certificate.expiryDate}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Badge variant="outline" className={`${config.color} border font-medium`}>
          {config.label}
        </Badge>
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 bg-transparent">
          <Download className="h-4 w-4 mr-2" />
          Baixar
        </Button>
      </div>
    </div>
  )
}

interface Certificate {
  id: string
  name: string
  type: string
  expiryDate: string
  status: "valid" | "expiring" | "expired"
}

const mockCertificates: Certificate[] = [
  {
    id: "1",
    name: "Certidão Negativa de Débitos Federais",
    type: "Federal",
    expiryDate: "15/06/2025",
    status: "valid",
  },
  {
    id: "2",
    name: "Certidão Negativa de Débitos Estaduais",
    type: "Estadual",
    expiryDate: "20/12/2024",
    status: "expiring",
  },
  {
    id: "3",
    name: "Certidão Negativa de Débitos Municipais",
    type: "Municipal",
    expiryDate: "10/11/2024",
    status: "expired",
  },
  {
    id: "4",
    name: "CND INSS",
    type: "Federal",
    expiryDate: "25/03/2025",
    status: "valid",
  },
  {
    id: "5",
    name: "CND FGTS",
    type: "Federal",
    expiryDate: "18/01/2025",
    status: "expiring",
  },
  {
    id: "6",
    name: "Certidão Trabalhista",
    type: "Federal",
    expiryDate: "30/04/2025",
    status: "valid",
  },
]
