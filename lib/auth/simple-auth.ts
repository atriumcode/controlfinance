import { createClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "manager" | "user" | "accountant"
  company_id: string
  is_active: boolean
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Generate session token
export function generateSessionToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36)
}

// Register new user
export async function registerUser(data: {
  email: string
  password: string
  full_name: string
  company_name?: string
  cnpj?: string
  role?: string
}): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", data.email).single()

    if (existingUser) {
      return { success: false, error: "Este email já está cadastrado" }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Handle company creation/lookup
    let companyId: string

    if (data.cnpj) {
      // Check if company exists
      const { data: existingCompany } = await supabase.from("companies").select("id").eq("cnpj", data.cnpj).single()

      if (existingCompany) {
        companyId = existingCompany.id
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: data.company_name || "Nova Empresa",
            cnpj: data.cnpj,
          })
          .select("id")
          .single()

        if (companyError || !newCompany) {
          return { success: false, error: "Erro ao criar empresa" }
        }

        companyId = newCompany.id
      }
    } else {
      // Get first company or create default
      const { data: firstCompany } = await supabase.from("companies").select("id").limit(1).single()

      if (firstCompany) {
        companyId = firstCompany.id
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: "Empresa Padrão",
            cnpj: "00000000000000",
          })
          .select("id")
          .single()

        if (companyError || !newCompany) {
          return { success: false, error: "Erro ao criar empresa padrão" }
        }

        companyId = newCompany.id
      }
    }

    // Create user profile
    const { data: newUser, error: userError } = await supabase
      .from("profiles")
      .insert({
        email: data.email,
        password_hash: passwordHash,
        full_name: data.full_name,
        role: data.role || "user",
        company_id: companyId,
        is_active: true,
      })
      .select("id, email, full_name, role, company_id, is_active")
      .single()

    if (userError || !newUser) {
      return { success: false, error: "Erro ao criar usuário" }
    }

    return {
      success: true,
      user: newUser as User,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Get user with password hash
    const { data: user, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, company_id, is_active, password_hash")
      .eq("email", email)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      return { success: false, error: "Email ou senha incorretos" }
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Email ou senha incorretos" }
    }

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const { error: sessionError } = await supabase.from("user_sessions").insert({
      user_id: user.id,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
    })

    if (sessionError) {
      return { success: false, error: "Erro ao criar sessão" }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
    })

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user

    return {
      success: true,
      user: userWithoutPassword as User,
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (!sessionToken) {
      return null
    }

    const supabase = await createClient()

    // Get session and user
    const { data: session, error: sessionError } = await supabase
      .from("user_sessions")
      .select(`
        user_id,
        expires_at,
        profiles (
          id,
          email,
          full_name,
          role,
          company_id,
          is_active
        )
      `)
      .eq("session_token", sessionToken)
      .eq("profiles.is_active", true)
      .single()

    if (sessionError || !session) {
      return null
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)

      return null
    }

    return session.profiles as User
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    if (sessionToken) {
      const supabase = await createClient()

      // Delete session from database
      await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
    }

    // Clear session cookie
    cookieStore.delete("session_token")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// Require authentication (for server components)
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

// Check if user has required role
export function hasRole(user: User, requiredRoles: string[]): boolean {
  return requiredRoles.includes(user.role)
}
