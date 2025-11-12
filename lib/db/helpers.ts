import { pool } from "./postgres"
import type { QueryResult } from "pg"

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await pool.connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(text, params)
  return result.rows[0] || null
}

export async function queryMany<T = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await query<T>(text, params)
  return result.rows
}

export async function execute(text: string, params?: any[]): Promise<number> {
  const result = await query(text, params)
  return result.rowCount || 0
}
