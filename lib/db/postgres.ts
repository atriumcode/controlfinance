import { Pool } from "pg"
import { readFileSync, existsSync } from "fs"
import path from "path"

const envPath = path.join(process.cwd(), ".env.local")
console.log("[v0] Looking for .env.local at:", envPath)

if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8")
  console.log("[v0] .env.local file found, parsing...")

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=")
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=").trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        process.env[key] = value
        console.log("[v0] Loaded env var:", key)
      }
    }
  })
} else {
  console.error("[v0] .env.local file NOT FOUND at:", envPath)
}

console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)
console.log("[v0] DATABASE_URL value:", process.env.DATABASE_URL?.substring(0, 30) + "...")

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
