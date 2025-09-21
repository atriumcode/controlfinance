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

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  full_name: string
  company_name?: string
  cnpj?: string
  role?: string
}
