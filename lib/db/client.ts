import { query, execute } from "./postgres"

export interface DbClient {
  from: (table: string) => TableQuery
}

export interface TableQuery {
  select: (columns?: string) => SelectQuery
  insert: (data: any | any[]) => InsertQuery
  update: (data: any) => UpdateQuery
  delete: () => DeleteQuery
}

class SelectQuery {
  private table: string
  private columns = "*"
  private whereConditions: { column: string; value: any; operator: string }[] = []
  private orderByClause: string | null = null
  private limitValue: number | null = null
  private singleRow = false

  constructor(table: string, columns?: string) {
    this.table = table
    if (columns) this.columns = columns
  }

  eq(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: "=" })
    return this
  }

  neq(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: "!=" })
    return this
  }

  gt(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: ">" })
    return this
  }

  gte(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: ">=" })
    return this
  }

  lt(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: "<" })
    return this
  }

  lte(column: string, value: any): this {
    this.whereConditions.push({ column, value, operator: "<=" })
    return this
  }

  like(column: string, value: string): this {
    this.whereConditions.push({ column, value, operator: "LIKE" })
    return this
  }

  ilike(column: string, value: string): this {
    this.whereConditions.push({ column, value, operator: "ILIKE" })
    return this
  }

  order(column: string, options?: { ascending?: boolean }): this {
    const direction = options?.ascending === false ? "DESC" : "ASC"
    this.orderByClause = `${column} ${direction}`
    return this
  }

  limit(value: number): this {
    this.limitValue = value
    return this
  }

  single(): this {
    this.singleRow = true
    this.limitValue = 1
    return this
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      let sql = `SELECT ${this.columns} FROM ${this.table}`
      const params: any[] = []
      let paramIndex = 1

      if (this.whereConditions.length > 0) {
        const conditions = this.whereConditions.map((cond) => {
          params.push(cond.value)
          return `${cond.column} ${cond.operator} $${paramIndex++}`
        })
        sql += ` WHERE ${conditions.join(" AND ")}`
      }

      if (this.orderByClause) {
        sql += ` ORDER BY ${this.orderByClause}`
      }

      if (this.limitValue) {
        sql += ` LIMIT ${this.limitValue}`
      }

      const rows = await query(sql, params)

      if (this.singleRow) {
        return { data: rows[0] || null, error: null }
      }

      return { data: rows, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

class InsertQuery {
  private table: string
  private data: any | any[]

  constructor(table: string, data: any | any[]) {
    this.table = table
    this.data = data
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      const records = Array.isArray(this.data) ? this.data : [this.data]

      if (records.length === 0) {
        return { data: null, error: { message: "No data to insert" } }
      }

      const keys = Object.keys(records[0])
      const columns = keys.join(", ")

      const valueSets: string[] = []
      const params: any[] = []
      let paramIndex = 1

      for (const record of records) {
        const placeholders = keys.map(() => `$${paramIndex++}`)
        valueSets.push(`(${placeholders.join(", ")})`)
        params.push(...keys.map((key) => record[key]))
      }

      const sql = `INSERT INTO ${this.table} (${columns}) VALUES ${valueSets.join(", ")} RETURNING *`
      const rows = await query(sql, params)

      return { data: rows, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

class UpdateQuery {
  private table: string
  private data: any
  private whereConditions: { column: string; value: any }[] = []

  constructor(table: string, data: any) {
    this.table = table
    this.data = data
  }

  eq(column: string, value: any): this {
    this.whereConditions.push({ column, value })
    return this
  }

  async execute(): Promise<{ data: any; error: any }> {
    try {
      const keys = Object.keys(this.data)
      const params: any[] = []
      let paramIndex = 1

      const setClause = keys
        .map((key) => {
          params.push(this.data[key])
          return `${key} = $${paramIndex++}`
        })
        .join(", ")

      let sql = `UPDATE ${this.table} SET ${setClause}`

      if (this.whereConditions.length > 0) {
        const conditions = this.whereConditions.map((cond) => {
          params.push(cond.value)
          return `${cond.column} = $${paramIndex++}`
        })
        sql += ` WHERE ${conditions.join(" AND ")}`
      }

      sql += " RETURNING *"

      const rows = await query(sql, params)
      return { data: rows, error: null }
    } catch (error: any) {
      return { data: null, error: { message: error.message } }
    }
  }
}

class DeleteQuery {
  private table: string
  private whereConditions: { column: string; value: any }[] = []

  constructor(table: string) {
    this.table = table
  }

  eq(column: string, value: any): this {
    this.whereConditions.push({ column, value })
    return this
  }

  async execute(): Promise<{ error: any }> {
    try {
      const params: any[] = []
      let paramIndex = 1

      let sql = `DELETE FROM ${this.table}`

      if (this.whereConditions.length > 0) {
        const conditions = this.whereConditions.map((cond) => {
          params.push(cond.value)
          return `${cond.column} = $${paramIndex++}`
        })
        sql += ` WHERE ${conditions.join(" AND ")}`
      }

      await execute(sql, params)
      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    }
  }
}

class TableQueryImpl implements TableQuery {
  constructor(private table: string) {}

  select(columns?: string): SelectQuery {
    return new SelectQuery(this.table, columns)
  }

  insert(data: any | any[]): InsertQuery {
    return new InsertQuery(this.table, data)
  }

  update(data: any): UpdateQuery {
    return new UpdateQuery(this.table, data)
  }

  delete(): DeleteQuery {
    return new DeleteQuery(this.table)
  }
}

export function createClient(): DbClient {
  return {
    from: (table: string) => new TableQueryImpl(table),
  }
}

export function createAdminClient(): DbClient {
  return createClient()
}

export { createClient as createServerClient, createClient as createBrowserClient }
