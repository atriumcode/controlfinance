// Gerenciamento de sessões de usuário
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/db/client"
import crypto from "crypto"

const SESSION_COOKIE_NAME = "auth_session"
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 dias

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  role: string
  company_id: string | null
  is_active: boolean
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function createSession(userId: string): Promise<string> {
  const db = createAdminClient()
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  console.log("[v0] Creating session for user:", userId)

  const { error } = await db
    .from("sessions")
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .execute()

  if (error) {
    console.error("[v0] Error creating session:", error)
    throw new Error("Erro ao criar sessão")
  }

  console.log("[v0] Session created in database, setting cookie...")

  // Salvar token no cookie
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === "production"
  const isHttps = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") || false

  console.log("[v0] Cookie settings - NODE_ENV:", process.env.NODE_ENV)
  console.log("[v0] Cookie settings - isProduction:", isProduction)
  console.log("[v0] Cookie settings - isHttps:", isHttps)
  console.log("[v0] Cookie settings - secure will be:", isProduction && isHttps)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction && isHttps, // Only secure if HTTPS
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  console.log("[v0] Cookie set successfully")

  return token
}

export async function getSession(): Promise<{
  session: Session | null
  user: User | null
}> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return { session: null, user: null }
  }

  const db = createAdminClient()

  // Buscar sessão
  const { data: session, error: sessionError } = await db
    .from("sessions")
    .select("*")
    .eq("token", token)
    .single()
    .execute()

  if (sessionError || !session) {
    return { session: null, user: null }
  }

  // Verificar se a sessão expirou
  if (new Date(session.expires_at) < new Date()) {
    await deleteSession(token)
    return { session: null, user: null }
  }

  // Buscar usuário
  const { data: user, error: userError } = await db
    .from("profiles")
    .select("id, email, full_name, role, company_id, is_active")
    .eq("id", session.user_id)
    .single()
    .execute()

  if (userError || !user || !user.is_active) {
    return { session: null, user: null }
  }

  return { session, user }
}

export async function deleteSession(token?: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = token || cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    const db = createAdminClient()
    await db.from("sessions").delete().eq("token", sessionToken).execute()
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<User> {
  const { user } = await getSession()

  if (!user) {
    throw new Error("Não autenticado")
  }

  return user
}
