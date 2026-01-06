"use server"

import { createAdminClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth/actions"
import { revalidatePath } from "next/cache"

export async function updateOwnProfileAction(data: {
  fullName: string
}) {
  const user = await requireAuth()

  if (!data.fullName) {
    return { success: false, error: "Nome é obrigatório" }
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    return { success: false, error: "Erro ao atualizar perfil" }
  }

  revalidatePath("/dashboard/settings/profile")

  return { success: true }
}
