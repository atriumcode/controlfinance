import { PageHeader } from "@/components/layout/page-header"
import { ImportXmlForm } from "@/components/import/import-xml-form"

export default function ImportPage() {
  return (
    <>
      <PageHeader
        title="Importar NF-e"
        description="Importe notas fiscais via XML"
      />

      <ImportXmlForm />
    </>
  )
}
