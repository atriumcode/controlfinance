// Gerenciamento de sessões de usuário
import { cookies } from "next/headers"
import { query, execute } from "@/lib/db/postgres"
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
  const token = generateToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  console.log("[v0] Creating session for user:", userId)

  await execute(`INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`, [
    userId,
    token,
    expiresAt.toISOString(),
  ])

  console.log("[v0] Session created in database, setting cookie...")

  const cookieStore = cookies()
  const isProduction = process.env.NODE_ENV === "production"
  const isHttps = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") || false

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction && isHttps,
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

  const sessions = await query<Session>(`SELECT * FROM sessions WHERE token = $1 LIMIT 1`, [token])

  const session = sessions[0]

  if (!session) {
    return { session: null, user: null }
  }

  if (new Date(session.expires_at) < new Date()) {
    await deleteSession(token)
    return { session: null, user: null }
  }

  const users = await query<User>(
    `SELECT id, email, full_name, role, company_id, is_active FROM profiles WHERE id = $1 LIMIT 1`,
    [session.user_id],
  )

  const user = users[0]

  if (!user || !user.is_active) {
    return { session: null, user: null }
  }

  return { session, user }
}

export async function deleteSession(token?: string): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = token || cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await execute(`DELETE FROM sessions WHERE token = $1`, [sessionToken])
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
