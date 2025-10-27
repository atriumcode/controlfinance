// Script para deletar todos os usuários do Supabase Auth
// Execute com: node --loader ts-node/esm scripts/delete-all-auth-users.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function deleteAllUsers() {
  console.log("🔍 Buscando todos os usuários...")

  // Buscar todos os usuários
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error("❌ Erro ao listar usuários:", listError)
    return
  }

  console.log(`📊 Encontrados ${users.length} usuários`)

  if (users.length === 0) {
    console.log("✅ Nenhum usuário para deletar")
    return
  }

  // Confirmar antes de deletar
  console.log("⚠️  ATENÇÃO: Você está prestes a deletar TODOS os usuários!")
  console.log("⚠️  Esta ação NÃO pode ser desfeita!")

  // Deletar cada usuário
  let deletedCount = 0
  let errorCount = 0

  for (const user of users) {
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) {
      console.error(`❌ Erro ao deletar usuário ${user.email}:`, error)
      errorCount++
    } else {
      console.log(`✅ Usuário deletado: ${user.email}`)
      deletedCount++
    }
  }

  console.log("\n📊 Resumo:")
  console.log(`✅ Usuários deletados: ${deletedCount}`)
  console.log(`❌ Erros: ${errorCount}`)
}

deleteAllUsers()
