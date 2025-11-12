import { Pool } from "pg"
import dotenv from "dotenv"
import path from "path"

const envPath = path.join(process.cwd(), ".env.local")
dotenv.config({ path: envPath })

console.log("[v0] Loading environment from:", envPath)
console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)

if (process.env.DATABASE_URL) {
  // Validate URL format
  try {
    const url = new URL(process.env.DATABASE_URL)
    console.log(
      "[v0] Database config - protocol:",
      url.protocol,
      "host:",
      url.hostname,
      "port:",
      url.port,
      "database:",
      url.pathname.slice(1),
    )
  } catch (e) {
    console.error("[v0] Invalid DATABASE_URL format:", e)
  }
} else {
  console.error("[v0] DATABASE_URL is not set!")
}

// Singleton pattern para a conexão com PostgreSQL
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não está configurada. Verifique o arquivo .env.local")
    }

    console.log("[v0] Creating PostgreSQL pool with URL:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"))

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on("error", (err) => {
      console.error("[PostgreSQL] Unexpected error on idle client", err)
    })
  }

  return pool
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

export async function execute(text: string, params?: any[]): Promise<number> {
  const pool = getPool()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    return result.rowCount || 0
  } finally {
    client.release()
  }
}
