import { Pool } from "pg"

let poolInstance: Pool | null = null

export function getPool(): Pool {
  if (!poolInstance) {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      throw new Error("DATABASE_URL ou POSTGRES_URL não está configurada")
    }

    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL

    poolInstance = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    poolInstance.on("error", (err) => {
      console.error("[PostgreSQL] Unexpected error on idle client", err)
    })
  }

  return poolInstance
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

// Usar Object.defineProperty permite que pool seja acessado como uma propriedade,
// mas só é inicializado quando realmente usado (lazy loading)
export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    return getPool()[prop as keyof Pool]
  },
})
