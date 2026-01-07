"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { ClientsTable } from "@/components/clients/clients-table"

import { useToast } from "@/hooks/use-toast"

/* =========================
   TYPES
========================= */

export interface Client {
  id: string
  name: string
  document: string
  document_type: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string
}

/* =========================
   PAGE
========================= */

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  /* =========================
     FETCH
  ========================= */

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile")
      if (!res.ok) {
        router.push("/auth/login")
        return
      }

      const profile = await res.json()
      if (!profile.company_id) {
        router.push("/dashboard/settings")
        return
      }

      const { data, error } = await supabase
        .from("clients")
        .select(`
          id,
          name,
          document,
          document_type,
          email,
          phone,
          city,
          state,
          created_at
        `)
        .eq("company_id", profile.company_id)
        .order("name")

      if (error) throw error

      setClients(data || [])
    } catch (err) {
      console.error(err)
      toast({
        title: "Erro ao carregar clientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [router, supabase, toast])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes cadastrados"
        actions={
          <Button asChild>
            <Link href="/dashboard/clients/new">
              Novo Cliente
            </Link>
          </Button>
        }
      />

      <ClientsTable
        clients={clients}
        onRefresh={fetchClients}
      />
    </div>
  )
}
